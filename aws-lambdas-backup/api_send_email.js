var aws = require('aws-sdk');
var ses = new aws.SES({region: 'us-east-1'});

exports.handler = (event, context, callback) => {
    //Parse the body for necessary values 
    var body = JSON.parse(event.body);
    console.log(body);
    var emailAddress = body.emailAddress;

    console.log(body.dynamicValueStrings);
    var dynamicValues = JSON.parse(body.dynamicValueStrings);
    
    const unsubscribeLink = "https://962k5qfgt3.execute-api.us-east-1.amazonaws.com/Prod/unsubscribe-from-ses?email=" + emailAddress;
    dynamicValues["UNSUBSCRIBE_LINK"] = unsubscribeLink; // can we pass the key, value pair instead
    
    var dynamicValueStrings = JSON.stringify(dynamicValues);
    console.log(dynamicValueStrings);
    var templateName = body.templateId;
    
    
    var params = {
      Destination: { 
        CcAddresses: [
        ],
        ToAddresses: [
          emailAddress
        ]
  
      },
      ConfigurationSetName:"SNSNotifications",
      //ConfigurationSetName:"clickTest",
      Source: 'teamMailItTest@gmail.com',
      Template: templateName, /* change after */ 
      TemplateData: dynamicValueStrings,
      ReplyToAddresses: [],
    };
    
    var response;
    var sesResponse = new Promise(function(resolve, reject) {
        ses.sendTemplatedEmail(params, function (err, data) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("SES:",ses)
                console.log("DATA:",data);
                resolve(data);
            }
        });
    });
    
    //TODO: Need to figure out how to handle failed emails
    sesResponse.then(data => {
        console.log(data);
        createDatabaseLog(data.ResponseMetadata.RequestId, data.MessageId, emailAddress, templateName, dynamicValueStrings);
        var response = {
            "statusCode": 200,
            "isBase64Encoded": false,
            "body": JSON.stringify("Email Sent successfully"),
             headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
        callback(null, response);
        
    }).catch( error => {
        console.log(error.requestId);
        createFailedDatabaseLog(error.requestId, emailAddress, templateName, dynamicValueStrings, error.message)
        var response = {
            "statusCode": 500,
            "isBase64Encoded": false,
            "body": JSON.stringify("Email Did Not Sent successfully " + error),
             headers: {
                'Access-Control-Allow-Origin': '*',
            }
        };
        callback(null, response);
    });
};

function createDatabaseLog(requestId, messageId, emailAddress, templateName, dynamicValueStrings) {
    var ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});
    
    var params = {
          TableName: 'tEmailLog',
          Item: {

            'EmailAddress': {S: maskEmailAddress(emailAddress)},
            'SentDateTime' : {S: new Date(Date.now()).toString()},
            'CampaignId': {S: requestId},
            'MessageId': {S: messageId},
            'TemplateName' : {S: templateName},
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
            'EmailAddress': {S: maskEmailAddress(emailAddress)},
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

function maskEmailAddress(emailAddress) {
    let redact = "XXXXXXXXXX";
    return emailAddress.charAt(0) + redact;
}
