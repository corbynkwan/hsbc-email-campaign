
import axios from 'axios'

const uploadFile = async (fileInput,BUCKET_NAME, templateName) => {
    console.log("File inputted",fileInput);
    if(typeof(fileInput) !== 'object' || !(fileInput instanceof File)) {
        
        throw Error("File input is not of type File");
    }

    if((typeof(BUCKET_NAME)) !== "string" || BUCKET_NAME == null) {
        throw Error("Bucket name is not a string");
    }

    if(BUCKET_NAME === "") {
        throw Error("Bucket name cannot be an empty string");
    }
    // read content from the file
    var fileBase64String = await encodeFileAsBase64String(fileInput);
    var fileType = fileInput.type;
    var fileName = fileInput.name;
    
    // setting up s3 upload parameters
    try {
     var header = { headers: {
        "x-api-key": process.env.REACT_APP_AWS_TEMPLATE_API_KEY
     }};

    var body = {
        bucket: BUCKET_NAME,
        content: fileBase64String,
        templateName: templateName,
        contentType: fileType
    };

    //Create and send API request to /template endpoint
    const res = await axios.post(`https://q6z3mxhv9d.execute-api.us-east-1.amazonaws.com/v1/template`, 
                                    body, header);
    if(res.data.statusCode !== 200) {
        throw new Error(res.data.body);
    }
    } catch (err) {
        console.log("Document Upload Error:",err);
      throw err;
    }
    
};

const removeFile = async (templateName) => {
    
    // setting up s3 upload parameters
    try {
     var header = { headers: {
        "x-api-key": process.env.REACT_APP_AWS_TEMPLATE_API_KEY
     }};

    var body = {
        templateName: templateName,
    };

    //Create and send API request to /template endpoint
    const res = await axios.post(`https://zzrc6grroe.execute-api.us-east-1.amazonaws.com/removal/remove`, 
                                    body, header);
    if(res.data.statusCode !== 200) {
        console.log("Remove File Error",res);
        throw new Error(res.data.body);
    }
    } catch (err) {
      throw err;
    }
    
};

const createBatchEmailCampaign = async(fileInput, subjectLine, templateName, dynamicValues) => {
    if(typeof(fileInput) !== 'object' || !(fileInput instanceof File)) {
        throw Error("File input is not of type File");
    }

    // read content from the file
    var fileText = await encodeFileAsText(fileInput);
    // setting up s3 upload parameters
    try {
     var header = { headers: {
        "x-api-key": "1X49emniv45661qhcv1VD8G5kDuliOkl1kjuJsH3"
     }};

    var body = {
        fileContent: fileText,
        dynamicValues: dynamicValues,
        subjectLine: subjectLine,
        templateId: templateName
    };

    //Create and send API request to /template endpoint
    const res = await axios.post(`https://962k5qfgt3.execute-api.us-east-1.amazonaws.com/ProdBatch/batchemailcampaign`, 
                                    body, header);
    if(res.data.statusCode !== 200) {
        console.log("Create Batch Email Error",res);
        throw new Error(res.data.body);
    }
    return res.data;
    } catch (err) {
      throw err;
    }

}


const encodeFileAsText = async (fileInput) => {
   return new Promise((resolve, reject) => {
        try {

            let reader = new FileReader();
            reader.onload = function() {
                if(reader.readyState === FileReader.DONE) {
                    resolve(reader.result);
                }
            };
            
            reader.readAsText(fileInput);
        } catch(err) {
            reject(err);
        }
   });
};


const encodeFileAsBase64String = async (fileInput) => {
    return new Promise((resolve, reject) => {
         try {
 
             let reader = new FileReader();
             reader.onload = function() {
                 if(reader.readyState === FileReader.DONE) {
                     resolve(reader.result);
                 }
             };
 
             reader.readAsDataURL(fileInput);
         } catch(err) {
             reject(err);
         }
    });
 };

export {uploadFile, createBatchEmailCampaign, removeFile}
