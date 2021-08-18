var path = require('path'),
  async = require('async'), //https://www.npmjs.com/package/async
  newman = require('newman'),

  parametersForTestRun = {
    collection: path.join(__dirname, 'TemplateUpload.postman_collection.json'), // your collection
    environment: path.join(__dirname, 'postman_environment.json'), //your env
  };

parallelCollectionRun = function(done) {
  newman.run(parametersForTestRun, done);
};

var templates = [];

for (var i=0; i<1; i++) {
    templates.push(parallelCollectionRun);
}


var start = new Date().getTime();
// Runs the Postman sample collection thrice, in parallel.
async.parallel(templates,
  function(err, results) {
    err && console.error(err);

    results.forEach(function(result) {
      var failures = result.run.failures;
      console.info(failures.length ? JSON.stringify(failures.failures, null, 2) :
        `${result.collection.name} ran successfully.`);
    });
    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time + " milliseconds");
  });
 

  // to execute cd test-scripts
  // change fileName in TemplateUpload.postman_collection.json
  // \n\"fileName\": \"donotremove2666.docx\"
  // node upload-template-runner.js