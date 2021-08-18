const AWS = require('aws-sdk');

exports.handler = async(event) => {
    var templateName = event.templateName;
    AWS.config.update({ region: 'us-east-1' });

    

    var templateParams = {
            TemplateName: templateName
        };
    

    try {
        var templatePromise = await deleteEmailTemplateInSES(templateParams);
    } catch(error) {
        return {
            statusCode: 404,
            body: JSON.stringify(error.message)
        }
    }
    
    
    var databaseParams = {
        TableName: 'tTemplateLog',
        Key: templateParams,
        UpdateExpression: "set UploadStatus = :u",
        ConditionExpression: "TemplateName = :t AND UploadStatus = :s",
        ExpressionAttributeValues:{
            ":u":"Deactivated",
            ":t": templateName, 
            ":s": "Ready"
        },
        ReturnValues:"UPDATED_NEW"
    };
    
    
    var databaseResponse = await createTemplateDatabaseLog(databaseParams);
    

    //Create the API response 
    const response = {
        statusCode: 200,
        template: templateParams,
        promise: templatePromise,

    };

    return response;
};



const deleteEmailTemplateInSES = async(templateParams) => {
    var templatePromise;

    try {
        templatePromise = await new AWS.SES({ apiVersion: '2010-12-01' }).deleteTemplate(templateParams).promise();
    }
    catch (err) {
        console.error(err, err.stack)
        throw new Error("Template name could not be found. Please choose another.");
    }

    return templatePromise;
};




const createTemplateDatabaseLog = async(dbParams) => {

    var docClient = new AWS.DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
        
        docClient.update(dbParams, function(err, data) {
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





    
 