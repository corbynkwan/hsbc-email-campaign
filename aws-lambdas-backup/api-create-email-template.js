const AWS = require('aws-sdk');
const util = require('util');
const mammoth = require("mammoth");
const s3 = new AWS.S3({ httpOptions: { timeout: 1000 } });
const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOCX_FILE_BASE64_ENCODING_HEADER = /^data:application\/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,/
const DOCX_BUCKET_NAME = "docxtemplates";

exports.handler = async(event) => {
    AWS.config.update({ region: 'us-east-1' });

    //S3 sdk object and key to access file in future 
    var bucket = event.bucket;
    var templateName = event.templateName;
    var fileContent = event.content;
    var contentType = event.contentType;
    
    var getParamsDocx = {
        Bucket: bucket,
        Key: templateName
    }

    if (bucket !== DOCX_BUCKET_NAME) {
        return {
            statusCode: 404,
            body: JSON.stringify('S3 Bucket name for storing docx files is incorrect')
        }
    }

    if (templateName == null || templateName === "") {
        return {
            statusCode: 404,
            body: JSON.stringify('Template Name has not been provided.')
        }
    }


    if (contentType !== DOCX_MIME_TYPE) {
        return {
            statusCode: 404,
            body: JSON.stringify('The upload file is not a .docx file type: ' + event.contentType)
        }
    }

    //Check if the template name is in use, if so throw an error
    var templatePromise = await new AWS.SES({ apiVersion: '2010-12-01' }).getTemplate({TemplateName: templateName}).promise()
                                    .catch((error) => {})
    

    if(templatePromise) {
        return {
            statusCode: 404,
            body: JSON.stringify(`The Template Name ${templateName} is already in use. Please provide a template name not currently in use and try again.`)
        }
    }
    
    //Remove the DOCX_FILE_BASE64_ENCODING_HEADER from the encoded docx file and create a buffer
    const buff = createDocxBuffer(fileContent);

    //Put file into S3 bucket, if an error occurs return internal server errors
    var putParams = {
        Bucket: bucket,
        Key: templateName,
        Body: buff,
        ContentEncoding: 'base64',
        ContentType: contentType
    };

    
    // put in new bucket with public view for images
    var putParamsImages = { 
      Bucket: 'docximages', 
      Key: templateName + "/"
    };
    
    
    
    s3.putObject(putParamsImages).promise();
    
    await s3.putObject(putParams).promise().catch((error) => {
        return {
            statusCode: 500,
            body: JSON.stringify('Error uploading file to S3: ' + error)
        }
    });
    
    var index=0;
   
    var options = {
        convertImage: mammoth.images.imgElement(function(image) {
            return image.read().then(function(imageBuffer) {
                index++;
                const destparams = {
                    Bucket: putParamsImages.Bucket,
                    Key: putParamsImages.Key + index,
                    Body: imageBuffer,
                    ContentType: "image/png"
                };
                s3.putObject(destparams).promise();
                return {
                    src: 'https://docximages.s3.amazonaws.com/' + putParamsImages.Key + index,
                };
            });
        })
    };

    //Convert file to html
    var resulting_html = await mammoth.convertToHtml({ buffer: buff }, options);
    var resulting_html_string = resulting_html.value.toString();
    if(resulting_html_string == null || resulting_html_string.trim() === "" ) {
        return {
            statusCode: 404,
            body: JSON.stringify("Empty files cannot be uploaded")
        }
    }
    
    //Parse html string for 
    let dynamicValues = [];
    try {
        dynamicValues = parseDynamicValues(resulting_html_string);
    } catch (err) {
        console.log(err);
        return {
            statusCode: 404,
            body: JSON.stringify(err.message)
        }
    }
    
    var resulting_html_string_dynamic_vals_converted = resulting_html_string.replace(/\$\{/g, "{{").replace(/\}/g, "}}");
    var resulting_html_string_unsubscribe = appendUnsubscribeLink(resulting_html_string_dynamic_vals_converted);
    
    console.log(resulting_html_string_unsubscribe);
    var text = resulting_html.value.toString().replace(/<\/?[^>]+>/ig, " ");

    var templateParams = {
        Template: {
            TemplateName: templateName,
            HtmlPart: resulting_html_string_unsubscribe,
            SubjectPart: "{{SUBJECT_LINE}}",
            TextPart: text
        }
    };

    try {
        var templatePromise = await createEmailTemplateInSES(templateParams);
    } catch(error) {
        return {
            statusCode: 404,
            body: JSON.stringify(error.message)
        }
    }
    

    //Create the Template Log in DynamoDB
    var databaseParams = {
        TableName: 'tTemplateLog',
        Item: {
            'TemplateName': { S: templateName },
            'DynamicValues': { S: JSON.stringify(dynamicValues) },
            'DocUploadDateTime': { S: new Date(Date.now()).toString() },
            'S3Key': { S: templateName },
            'Team': { S: 'TODO' },
            'UploadStatus': { S: 'Ready' },
        }
    };

    var databaseResponse = await createTemplateDatabaseLog(databaseParams);

    //Create the API response 
    const response = {
        statusCode: 200,
        size: buff.length,
        result: resulting_html,
        text: text,
        template: templateParams,
        promise: templatePromise,

    };

    return response;
};

const createDocxBuffer = (fileContent) => {
    const base64String = fileContent.replace(DOCX_FILE_BASE64_ENCODING_HEADER, '');
    return new Buffer(base64String, 'base64');
};

const createEmailTemplateInSES = async(templateParams) => {
    var templatePromise;

    try {
        templatePromise = await new AWS.SES({ apiVersion: '2010-12-01' }).createTemplate(templateParams).promise();
    }
    catch (err) {
        throw err;
    }

    return templatePromise;
};

const createTemplateDatabaseLog = async(dbParams) => {

    var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

    return new Promise((resolve, reject) => {
        ddb.putItem(dbParams, function(err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            }
            else {
                console.log("Success", data);
                resolve(data);
            }
        });
    });

};

const parseDynamicValues = (htmlString) => {
    let dynamicValues = [];
    let htmlStringArray = htmlString.split("${");
    for(var i =0; i<htmlStringArray.length; i++) {
        var fragment = htmlStringArray[i];
        
        if(i > 0) {
            var indexCloseBracket = fragment.indexOf("}");
            if(indexCloseBracket === -1) {
                throw new Error("This template contains a dynamic value that doesn't close");
            } 
        
            let dynamicValue = fragment.substring(0, indexCloseBracket);
            let dynamicValueRegex = /^[a-zA-Z]+[_a-zA-Z]+[a-zA-Z]+$/
            if(dynamicValueRegex.test(dynamicValue)) {
                if(!dynamicValues.includes(dynamicValue)) {
                    dynamicValues.push(dynamicValue);
                }
            } else {
                throw new Error("This template contains a dynamic value that doesn't contain text that follows the regex format of [a-zA-Z]+[_a-zA-Z]+[a-zA-Z]+");
            }
        }
        
        
    }
    return dynamicValues;
    
    
    
}

const appendUnsubscribeLink = (htmlString) => {
    
    return htmlString += "<p>Unsubscribe From Future Emails: {{UNSUBSCRIBE_LINK}}</p>";
}
