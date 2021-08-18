var aws = require('aws-sdk');
var ses = new aws.SES({region: 'us-east-1'});
var s3 = new aws.S3({httpOptions: {timeout: 30000}});
const parser = require('papaparse');
const CSV_FILE_BASE64_ENCODING_HEADER = /^data:text\/csv;base64,/
    
exports.handler = async (event, context, callback) => {
    var data = event.fileContent;
    let parsedData = await getCSVData(data);
    var tempalteId = event.templateId; 
    var subjectLine = event.subjectLine;
    var dynamicValues = event.dynamicValues;
    if(tempalteId == null || tempalteId === "") {
        let response = {
            "statusCode": 400,
            "isBase64Encoded": false,
            "body": JSON.stringify(`The templateId cannot be empty`)
        }
        callback(null, response);
        return;
    }
    
    if(subjectLine == null || subjectLine === "") {
        let response = {
            "statusCode": 400,
            "isBase64Encoded": false,
            "body": JSON.stringify(`The subject line cannot be empty.`)
        }
        callback(null, response);
        return;
    }
    
    let jsonDataResult = {};
    let destinations = null;
    console.log(parsedData);
    try {
        jsonDataResult = parseEntriesForErrors(parsedData, dynamicValues);
    } catch(error) {
        let response = {
            "statusCode": 400,
            "isBase64Encoded": false,
            "body": JSON.stringify(`The following error was detected when parsing the .csv file: ` + error)
        }
        callback(null, response);
        return;
    }
    
    try {
        destinations = generateDestinationObjects(jsonDataResult, subjectLine);
    } catch(error) {
        let response = {
            "statusCode": 400,
            "isBase64Encoded": false,
            "body": JSON.stringify(`The following error was detected when parsing the .csv file: ` + error)
        }
        callback(null, response);
        return;
    }
    
   let sesResponses = [];
   let subsetDestinations = [];
   console.log("made it");
   console.log(destinations);
   for(var i = 0; i< destinations.length; i++) {
       subsetDestinations.push(destinations[i]);
       console.log(subsetDestinations);
       if((i != 0 && i % 49 == 0) || i == destinations.length - 1) {
           let batchDestinations = [];
           for(var subsetDestination of subsetDestinations) {
               batchDestinations.push(subsetDestination);
           }
           subsetDestinations = [];
           sesResponses.push(sendBatchOfEmails(batchDestinations, tempalteId, dynamicValues, subjectLine));
       } 
   }
   
   let dataObjects = await Promise.all(sesResponses).catch((error) => {
        var response = {
            "statusCode": 500,
            "isBase64Encoded": false,
            "body": JSON.stringify("Emails Did Not Sent successfully " + error)
        };
        callback(null, response);
        return;
   });
       let count = 0;
       let successCount = 0;
       let failedCount = 0;
       for(var data of dataObjects) {
           var startCount = count;
           count += data.Status.length;
           for(var i = 0; i < data.Status.length; i++) {
               let entry = jsonDataResult[startCount + i];
               if(data.Status[i].Status !== "Success") {
                   failedCount++;
                   createFailedDatabaseLog(data.ResponseMetadata.RequestId, 
                                           maskEmailAddress(entry["Email Address"]), 
                                           tempalteId, 
                                           getDynamicValueStrings(entry, subjectLine), 
                                           data.Status[i].Error);
               } else {
                   successCount++;
                   createDatabaseLog(data.ResponseMetadata.RequestId, 
                                     data.Status[i].MessageId, 
                                     maskEmailAddress(entry["Email Address"]), 
                                     tempalteId, 
                                     getDynamicValueStrings(entry, subjectLine));
               }
               
           }
       }
       console.log("made it");
       if(successCount == destinations.length) {
           var response = {
                "statusCode": 200,
                "isBase64Encoded": false,
                "body": JSON.stringify("All emails sent successfully")
            };
            callback(null, response);
       } else if (failedCount == destinations.length) {
           var response = {
               "statusCode": 404,
               "isBase64Encoded": false,
               "body": JSON.stringify(`All messages could not be sent. Please refer to the email logs for ${tempalteId} for more details.`)
           }
           callback(null, response);
       } else {
          var response = {
                "statusCode": 200,
                "isBase64Encoded": false,
                "body": JSON.stringify(`${successCount} emails sent successfully and ${failedCount} could not be sent. Please refer to the email logs for ${tempalteId} for more details.`)
            };
            callback(null, response); 
       }
};


const getCSVData = async (csvData) => {
   console.log(csvData);
    let parsedData = parser.parse(csvData, {
        header: true
    });
    
    return parsedData;
    
}

const createDefaultTemplateData = (dynamicValues, subjectLine) => {
    let dynamicValueObject = {};
    console.log(dynamicValues);
    for(var dynamicValue of dynamicValues) {
        dynamicValueObject[dynamicValue] = "Default";
    }
    dynamicValueObject["SUBJECT_LINE"] =  subjectLine;
    dynamicValueObject["UNSUBSCRIBE_LINK"] = "Default;"
    return dynamicValueObject;
}
        

function generateDestinationObjects(jsonData, subjectLine) {
    return jsonData.map((entry) => {
       let emailAddress = entry["Email Address"];
       if (!validateEmail(emailAddress)) {
           throw new Error(`The email address ${emailAddress} is incorrectly formatted.`);
       }
       return {
           Destination: {
               ToAddresses: [ 
                   emailAddress 
               ]
           },
           ReplacementTemplateData: getDynamicValueStrings(entry, subjectLine)
       }
   })
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function createDatabaseLog(jobLogId, messageId, emailAddress, templateName, dynamicValueStrings) {
    var ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});

    var params = {
          TableName: 'tEmailLog',
          Item: {
            'TemplateName' : {S: templateName},
            'CampaignId': {S: jobLogId},
            'MessageId': {S: messageId},
            'SentDateTime' : {S: new Date(Date.now()).toString()},
            'EmailAddress': {S: emailAddress},
            'DynamicValues' : {S: dynamicValueStrings},
            'DeliveryStatus' : {S: "NotDelivered"},
            'OpenedStatus' : {S: "NotOpened"},
            'ClickedLinkStatus': {S: "NotClicked"}
          }
        };

        console.log(params);
    ddb.putItem(params, function(err, data) {
      if (err) {
        console.log("Error creating email log", err);
      } else {
        console.log("Success creating email log");
      }
    });    
}

function createFailedDatabaseLog(jobLogId, emailAddress, templateName, dynamicValueStrings, failedMessage) {
    var ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});
    var errorMessage = "";
    if(failedMessage.includes("Email address is not verified.")) {
        errorMessage = "Email address is not verified.";
    } else if(failedMessage.includes("There are non-ASCII characters in the email address")) {
        errorMessage = "The email address contains non-ASCII characters";
    } else {
        errorMessage = "An error occured when sending this email. Please speak to the system administrator"
    }
    var params = {
          TableName: 'tEmailLog',
          Item: {
            'TemplateName' : {S: templateName},
            'CampaignId': {S: jobLogId},
            'MessageId': {S: "N/A"},
            'SentDateTime' : {S: new Date(Date.now()).toString()},
            'EmailAddress': {S: emailAddress},
            'DynamicValues' : {S: dynamicValueStrings},
            'DeliveryStatus' : {S: errorMessage},
            'OpenedStatus' : {S: "N/A"},
            'ClickedLinkStatus': {S: "N/A"}
          }
        };

        console.log(params);
    ddb.putItem(params, function(err, data) {
      if (err) {
        console.log("Error creating email log", err);
      } else {
        console.log("Success creating email log");
      }
    });    
}

function getDynamicValueStrings(entry, subjectLine) {
    let newEntry = {}
    for (let [key, value] of Object.entries(entry)) {
        if (key != "Email Address") {
            newEntry[key] = value;
        } else {
            newEntry['UNSUBSCRIBE_LINK'] = "https://962k5qfgt3.execute-api.us-east-1.amazonaws.com/Prod/unsubscribe-from-ses?email=" + newEntry[key];
        }
    }
    newEntry['SUBJECT_LINE'] = subjectLine;
    console.log(newEntry);
    return JSON.stringify(newEntry);
}

const parseEntriesForErrors = (parsedData, dynamicValues) => {
    if(parsedData.errors.length > 2  ) {
        throw new Error(`This file could not be parsed as a csv file. Please ensure that the file follows the correct csv formatting guidelines.`);
    }
    const possibleColumnNames = [...dynamicValues, "Email Address"];
    let errorList = [];
    let data = parsedData.data;
    let rowCount = data.length;
    let indexesOfEmptyRowsForRemoval = [];
    try {
        checkHeader(parsedData.meta.fields, possibleColumnNames);
    } catch (error) {
        throw error;
    }
    
    for(var i = 0; i<rowCount; i++ ) {
        let row = data[i];
        //For those using excel to create csv, it adds unneccessary blank entries in the last rows if there are less than 6 entries
        if(rowCount < 6) {
            let isThereAEmptyRow = isEmptyRow(row, possibleColumnNames);
            //If there are less than 4 entries in a csv file empty rows can be added to make the rowCount = 3 
            if(!isThereAEmptyRow && doesRowHaveEmptyCells(row, possibleColumnNames)) {
                console.log("made it earlier");
                throw new Error(`This file contains an empty cell.`);
            } else if(isThereAEmptyRow && i ===0) {
                throw new Error(`This file contains an empty row.`);
            } else if(isThereAEmptyRow ) {
                indexesOfEmptyRowsForRemoval.push(i);
            }
        } else {
            if(isEmptyRow(row, possibleColumnNames)) {
                throw new Error(`This file contains an empty row.`);
            }
            if(doesRowHaveEmptyCells(row, possibleColumnNames)) {
                console.log("made it");
                throw new Error(`This file contains an empty cell.`);
            }
        }
    }
    
    if(indexesOfEmptyRowsForRemoval !== []) {
        let updatedJsonDataResult = [];
        for(var i = 0; i < rowCount; i++) {
            if(!indexesOfEmptyRowsForRemoval.includes(i)) {
                updatedJsonDataResult.push(data[i]);
            }
        }
        return updatedJsonDataResult;
    }
    return data;
};

function checkHeader(header, possibleColumnNames) {
    if(header.length != possibleColumnNames.length) {
        throw new Error(`This file does not contain the correct number of columns. Please ensure that there is one Email Address column and one column per dynamic value.`);
    }
    let visitedColumns = [];
    header.forEach(column => {
        if(!possibleColumnNames.includes(column)) {
            throw new Error(`This file contains the column ${column} which is not Email Address or a existing dynamic value name`);
        }
        if(visitedColumns.includes(column)) {
            throw new Error(`This file contains multiple columns for the ${column} dynamic value`);
        }
        visitedColumns.push(column);
    });    
}

function isEmptyRow(row, possibleColumnNames) {
    for(var possibleColumnName of possibleColumnNames) {
        if(row[possibleColumnName] !== '' && row[possibleColumnName] != null ) {
            console.log(row[possibleColumnName]);
            return false;
        }
    }
    return true;
}

function doesRowHaveEmptyCells(row, possibleColumnNames) {
    for(var possibleColumnName of possibleColumnNames) {
        let cell = row[possibleColumnName];
        if(cell == null || cell.trim() === "") {
            return true;
        }
    }
    return false;
}

const sendBatchOfEmails = async(destinations, templateId, dynamicValues, subjectLine) => {
    var params = {
        Destinations: destinations,
        Source: 'teamMailItTest@gmail.com',
        Template: templateId, 
        DefaultTemplateData: JSON.stringify(createDefaultTemplateData(dynamicValues, subjectLine)),
        ConfigurationSetName: "SNSNotifications"
    };
    console.log(destinations);
    return new Promise(function(resolve, reject) {
            ses.sendBulkTemplatedEmail(params, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(data);
                    resolve(data);
                }
             });
    });     
}


function maskEmailAddress(emailAddress) {
    let redact = "XXXXXXXXXX";
    return emailAddress.charAt(0) + redact;
}





