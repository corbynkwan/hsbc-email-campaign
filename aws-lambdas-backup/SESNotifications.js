const aws = require('aws-sdk');

exports.handler = (event, context, callback) => {
    aws.config.update({region: 'us-east-1'});

    var docClient = new aws.DynamoDB.DocumentClient();
    
    console.log("Received event:", JSON.stringify(event, null, 2));

    var SnsPublishTime = event.Records[0].Sns.Timestamp;
    var SnsTopicArn = event.Records[0].Sns.TopicArn;

    // function updateItem() {
  
    var table = "tEmailLog";
  
    var SESMessage = event.Records[0].Sns.Message;
    SESMessage = JSON.parse(SESMessage);
    var SESMessageType = SESMessage.eventType;
    
    var SESMessageId = SESMessage.mail.messageId;
    SESMessageId = SESMessageId.toString();

    var SESDestinationAddress = SESMessage.mail.destination.toString();
    var LambdaReceiveTime = new Date().toString();
    
    var params = {
        TableName: table,
        IndexName: 'MessageId-SentDateTime-index',
        KeyConditionExpression: 'MessageId = :id',
        ExpressionAttributeValues: {
          ':id': SESMessageId
        }
    };
    
    docClient.query(params, function (err, result) {
        if (err) {
          console.log("Unable to query item. Error JSON:", JSON.stringify(err));
        } else {
            var templateId = result.Items[0].TemplateName;
          console.log(result);
          
          if (SESMessageType == "Open") {
            params = {
                TableName:table,
                Key:{
                    "MessageId": SESMessageId,
                    "TemplateName" : templateId
                },
                UpdateExpression: "set OpenedStatus=:y",
                ExpressionAttributeValues:{
                    ":y": "Opened"
                },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Updating the item...");
            // var docClient = new AWS.DynamoDB.DocumentClient();
            
            docClient.update(params, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                }
            });
        } else if (SESMessageType == "Click") {
            params = {
                TableName:table,
                Key:{
                    "MessageId": SESMessageId,
                    "TemplateName" : templateId
                },
                UpdateExpression: "set ClickedLinkStatus=:z",
                ExpressionAttributeValues:{
                    ":z": "Clicked"
                },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Updating the item...");
            // var docClient = new AWS.DynamoDB.DocumentClient();
            
            docClient.update(params, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                }
            });
        } else if (SESMessageType == "Delivery") {
            params = {
                TableName:table,
                Key:{
                    "MessageId": SESMessageId,
                    "TemplateName" : templateId
                },
                UpdateExpression: "set DeliveryStatus = :x",
                ExpressionAttributeValues:{
                    ":x": "Delivered"
                },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("Updating the item...");
            // var docClient = new AWS.DynamoDB.DocumentClient();
            
            docClient.update(params, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                }
            });
        }
    
            }
          });
    
    
};