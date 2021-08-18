// AWS SDK for JS
var AWS = require("aws-sdk");
var fs = require("fs");
AWS.config.update({region: "us-east-1"});

// document client interface for DynamoDB
var documentClient = new AWS.DynamoDB.DocumentClient();

 function separateCampaigns(queryResult) {
        let campaignMap = new Map();
        let data = queryResult.Items
        var i;
        for (i = 0; i < queryResult.Count; i++) {
            if (campaignMap.has(data[i].CampaignId)) {
                campaignMap.get(data[i].CampaignId).push(data[i])
            } else {
                let campaignArray = []
                campaignArray.push(data[i])
                campaignMap.set(data[i].CampaignId, campaignArray)
            }
        }
            return campaignMap
    }

    function makeRowInformation(separatedCampaigns) {
        var i;
        let tableForm = [];
        for (let [key, value] of separatedCampaigns) {
            let campaignId = key;
            let sentDateTime = value[0].SentDateTime;
            let numEmailed = 0;
            let numSuccessfullyDelivered = 0;
            let numOpened = 0;
            let numLinks = 0;
            for (i = 0; i < value.length; i++) {

                numEmailed ++;
                if (value[i].DeliveryStatus === "Delivered") {
                    numSuccessfullyDelivered ++;
                }
                if (value[i].OpenedStatus === "Opened") {
                    numOpened ++;
                }
                if (value[i].ClickedLinkStatus === "Clicked") {
                    numLinks ++;
                }
            }

            let row = {
                CampaignId: campaignId,
                SentDateTime: sentDateTime,
                NumEmailed: numEmailed,
                NumSuccessfullyDelivered: numSuccessfullyDelivered,
                NumOpened: numOpened,
                NumLinks: numLinks
            }
            tableForm.push(row)
        }
        return tableForm;
    }

exports.handler = async (event) => {
     
    var templateId = event.templateId
    var params = {
            KeyConditionExpression: 'TemplateName = :x',
            ExpressionAttributeValues: {
                ':x': templateId,
            },
            TableName: "tEmailLog"
        };
        
    try{
        var queryResult = await documentClient.query(params).promise()
        let separatedCampaigns = separateCampaigns(queryResult);
        let rowInformation = makeRowInformation(separatedCampaigns);
        
        var response = { statusCode: 200, body: rowInformation,  headers: {
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
}
    
    
 
   
   
   
   