 /* Intergated with Kevin's code - Route file of the Node server
    Verion 1.0
    Create Date: 07/27/2021 - created the route file 
    Update Date: 07/27/2021 - Updated awk rounte 

 */

// Import libs
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
var router = express.Router();


router.use(fileUpload({
    useTempFiles : true,
    tempFileDir : path.join(__dirname,'tmp'),
}));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index_LNR_awk.html'));
});

// let assginRecordNumbersPath = path.join(__dirname, './bin/awk/assginRecordNumbers.awk ');
// let csvPath = path.join(__dirname, './public/audit_log_files/temp.txt');
// let sortByTimePath = path.join(__dirname, './bin/awk/sortByTime.awk');
// let keepAuditLogsOnly = path.join(__dirname, './bin/awk/keepAuditLogsOnly.awk');
// let removeAdjacentDuplicates = path.join(__dirname, './bin/awk/removeAdjacentDuplicates.awk');
// let resetColOrder = path.join(__dirname, './bin/awk/resetColOrder.awk');
// let FromToSystemList = path.join(__dirname, './bin/awk/FromToSystemList.awk');
// let createdPlantUmlText = path.join(__dirname, './bin/awk/createdPlantUmlText.awk');
// let chart = path.join(__dirname, './public/generated_files/UML_sequence_charts/tmp.svg');
// let jarpackage = path.join(__dirname, './bin/awk/plantuml.jar');

router.post('/', (req, res)  => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    };

    // Accessing the file by the <input> File name="target_file"
    let targetFile = req.files.target_file;

    targetFile.mv(path.join(__dirname, '../public/audit_log_files/','tmp.txt'), (err) => {
        if (err) {  
              return res.status(500).send(err);
        };
        /*
        var example = require('./e2e-tracing-poc/ecomplogging');
        var file = example.readCSV('tmp.txt');
        */
        var exec = require('child_process').exec, child;
        // child = exec('awk -f ' + assginRecordNumbersPath + csvPath +
        // ' | awk -f ' + sortByTimePath + 
        // ' | awk -f '+ keepAuditLogsOnly +
        // ' | awk -f ' + removeAdjacentDuplicates + 
        // ' | awk -f ' + resetColOrder + 
        // ' | ask -f created ' + FromToSystemList +
        // ' | awk -f '+ createdPlantUmlText +
        // ' | java -jar ' + jarpackage + ' -tsvg -pipe > '+chart,
        // child = exec('awk -f ../bin/awk/assginRecordNumbers.awk ../public/audit log files/temp.txt | awk -f ../bin/awk/sortByTime.awk | awk -f ../bin/awk/keepAuditLogsOnly.awk | awk -f ../bin/awk/removeAdjacentDuplicates.awk | awk -f ../bin/awk/resetColOrder.awk | ask -f created ../bin/awk/FromToSystemList.awk | awk -f ../bin/awk/createdPlantUmlText.awk | java -jar plantuml.jar -tsvg -pipe > ../public/generated files/UML sequence charts/tmp.svg',
        child = exec('awk -f ./bin/awk/assignRecordNumbers.awk' + ' ./public/audit_log_files/tmp.txt ' + '| awk -f ./bin/awk/sortByTime.awk | awk -f ./bin/awk/keepAuditLogsOnly.awk | awk -f ./bin/awk/removeAdjacentDuplicates.awk | awk -f ./bin/awk/resetColOrder.awk | awk -f ./bin/awk/createFromToSystemList.awk | awk -f ./bin/awk/createPlantUmlText.awk | java -jar ./bin/awk/plantuml.jar -tsvg -pipe >  ./public/generated_files/UML_sequence_charts/tmp.svg',
        // child = exec('awk -f assignRecordNumbers.awk ./public/audit_log_files/tmp.txt | awk -f sortByTime.awk | awk -f keepAuditLogsOnly.awk | awk -f removeAdjacentDuplicates.awk | awk -f resetColOrder.awk | awk -f createFromToSystemList.awk | awk -f createPlantUmlText.awk | java -jar plantuml.jar -tsvg -pipe >  ./public/generated_files/UML_sequence_charts/tmp.svg',

        function (error, stdout, stderr){
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (stderr.length != 0) {
            console.log('exec error: ' + error);
            res.status(400).send("Error: No diagram found!");
          } 
          else {
            bmp = path.join(__dirname, '../public/generated_files/UML_sequence_charts/tmp.svg');
             res.sendFile(bmp)};
        });
        /*
        //Creates a route for calling jar file on web server
        router.get('/call-java-app', function (req, res, next){
        //call you function in here
        //respond with any data you want
        res.send('Your data here');
        });
        */
    });
});
    
// export all the routes
// server.js can import these routes
module.exports = router;




