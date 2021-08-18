// AWS SDK for JS
var AWS = require("aws-sdk");
var fs = require("fs");
AWS.config.update({region: "us-east-1"});

// document client interface for DynamoDB
var documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
     
    var templateId = event.templateId;
    var campaignId = event.campaignId;
    console.log(templateId);
    console.log(campaignId);
    var params = {
            IndexName: 'TemplateName-CampaignId-index',
            KeyConditionExpression: 'TemplateName =:x and CampaignId=:y',
            ExpressionAttributeValues: {
                ':x': templateId,
                ':y': campaignId
            },
            TableName: "tEmailLog"
        };
        
    try{
        var queryResult = await documentClient.query(params).promise()
        
        var response = { statusCode: 200, body: queryResult,  headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },}
    } catch (error) {
        var response = { statusCode: 400, body: error,  headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },}
    }

    return response
};
