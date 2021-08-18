exports.handler = (event, context, callback) => {
    // var body = JSON.parse(event.body);
    // var emailAddress = body.emailAddress;
    // console.log(body.dynamicValueStrings);
    // var dynamicValueStrings = body.dynamicValueStrings; // can we pass the key, value pair instead
    // //{ \"REPLACEMENT_TAG_NAME\":\"REPLACEMENT_VALUE\" }'
    // var tempalteId = body.templateId;

    
    
    // Load the AWS SDK for Node.js
    var aws = require('aws-sdk');
    var ses = new aws.SES({region: 'us-east-1'});
    console.log("test");
            console.log("3:",event);

            console.log("4:",event.queryStringParameters);

    //queryStringParameters are parameters given in the url i.e. path/unsubscribe-from-ses?email="corbynkwan@gmail.com"
    const { email } = event.queryStringParameters;
    //console.log("email:",email)
 var params = {
  Identity: email
 };
    console.log("test");
    var unsubscribeSesResponse = new Promise(function(resolve, reject) {
         ses.deleteIdentity(params, function(err, data) {
           if (err) {
               console.log(err, err.stack); 
               reject( err);
           } else {
               console.log(data); 
               resolve(data);
           }
         });
    });
    
    unsubscribeSesResponse.then(data => {
        console.log("works");
        var response = {
            "statusCode": 200,
            "body": "Email Unsubscribed Successfully" + JSON.stringify(event)
        };
        callback(null, response);
        
    }).catch( error => {
        console.log("no work");
        var response = {
            "statusCode": 500,
            "body": JSON.stringify(error)
        };
        callback(null, response);
    });
};