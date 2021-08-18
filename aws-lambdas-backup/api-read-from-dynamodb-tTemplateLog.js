const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = async (event, context, callback) => {
    await readTable().then(data => {
        data.Items.forEach(function(item) {
            console.log(item.TemplateName);
        });
        callback(null, {
            statusCode: 200,
            body: data.Items,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        
        callback(null, {
            statusCode: 200,
            body: err,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    })
    
};

function readTable() {
    var params = {
        TableName : "tTemplateLog"
    };//
    
    return ddb.scan(params).promise();
}