 /* Jeffrey's code - Route file of the Node server
    Verion 1.0
    Create Date: 07/04/2021 - created the route file 
    Create Date: 07/05/2021 - added the readCSV route 
    Create Date: 07/08/2021 - added the readPUML route 
    Create Date: 07/21/2021 - added the download route
 */

// Import libs
var fs = require('fs');
var express = require('express');
var multer  = require('multer');
var path = require('path');
const { config } = require('process');
var router = express.Router();

var randomName = "";
// Import ecomlogging.js
var pathEcomplogging = path.join(__dirname,'ecomplogging.js')
var ecomplogging = require(pathEcomplogging);

// Import return data and status code
var return_data = ecomplogging.return_data;
var statusCode = ecomplogging.statusCode;
var fileLoadMode = ecomplogging.fileLoadMode;

// Define the interval time 
var intervalID;

// Initialize the folder
// function create a new folder
var createFolder = function(folder){
    try{
      fs.accessSync(folder);
    }catch( e ){
      fs.mkdirSync(folder);
    }
};

// Create folder to save generated_files
var folderName = './public/generated_files/';
createFolder(folderName);

folderName = './public/generated_files/PlantUML_scripts/';
createFolder(folderName);

folderName = './public/generated_files/UML_sequence_charts/';
createFolder(folderName);

folderName = './public/sample_data/';
createFolder(folderName);

var uploadFolder = './public/audit_log_files/';
createFolder(uploadFolder);

// Store the CSV file uploaded form client
var storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, uploadFolder ); 
},
filename: function (req, file, cb) { 
    cb(null, file.originalname);
}})

var upload = multer({ storage: storage })


var uploadPUMLFolder = './public/generated_files/PlantUML_scripts/';
// Store the PlantUML file uploaded form client
var storagePUML = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPUMLFolder ); 
    },
    filename: function (req, file, cb) { 
        cb(null, file.originalname);
    }})
    
var uploadPUML = multer({ storage: storagePUML })
    
    

// Define the request's url and its response
// Route to the index page
// "/": url of this page
// req: requst from the client
// res: response to the client
// return: None
router.get('/', (req, res)=>{
    console.log(__dirname)

    // Send back the index.html page to the client
    res.sendFile(path.join(__dirname,'../views/index.html'));
})


// Define the request's url and its response 
// Route to the loadCSVFile method
// Read CSV file from client and call the fileNameWithPath() to process the record
// "/readCSV": url of this method
// upload.array('file'): CSV file posted by the client
// req: requst from the client
// res: response to the client
// return: None
router.post('/loadCSVFile', upload.array('file'), function(req, res) 
{
    var cnt = 0; // delay times
    return_data.RendnderAllUMLSequenceChartCompleted[0] = false;
    return_data.RendnderAllUMLSequenceChartCompleted[1] = false;

    // Check if CSV file is valid
    if (!req.files || Object.keys(req.files).length === 0) 
    {
        res.status(400).send('Please select a file to upload！');
        return;
    }

    let directory  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/' );


    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      });

    //   directory  = path.join(__dirname,'../public/generated_files/UML_sequence_charts/')
    //   fs.readdir(directory, (err, files) => {
    //     if (err) throw err;
      
    //     for (const file of files) {
    //       fs.unlink(path.join(directory, file), err => {
    //         if (err) throw err;
    //       });
    //     }
    //   });
      
      
    // construct the CSV file name
    let fileNameWithPath = path.join(__dirname,'../', req.files[0].path)

    // call the ecomploggingMain() to process CSV file
    // input
    //     - strFileNameWithPath: submited file name with path
    //     - loadMode: 0: submited a new CSV file, 1: submited a existing PlantUML file
    // return: 
    //     - return_data obj
    // randomName = Math.random();
    randomName = Math.round(Math.random()*1000);
    console.log(randomName);
    return_data = ecomplogging.ecomploggingMain(fileNameWithPath, fileLoadMode.loadCSVFile, randomName);

    if (return_data.statusCode == statusCode.EmptyFile)
    {
        // CSV file is empty
        res.status(200).send(return_data);
        return;
    }

    return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
    res.status(200).send(return_data);

    // Set a interval timer
    // intervalID = setInterval(function()
    // { 
    //     if (return_data.RendnderAllUMLSequenceChartCompleted[0] && return_data.RendnderAllUMLSequenceChartCompleted[1])
    //     {
    //         // Original and processed UML sequence chart are generated
    //         return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
    //         res.status(200).send(return_data);
    //         clearInterval(intervalID);
    //         return;

    //     }
    //     // else wait 1000 ms
    //     cnt++;
    //     if (cnt >=100)
    //     {
    //         // waiting for 20s exit
    //         return_data.statusCode = statusCode.RendnderAllUMLSequenceChartFailed;
    //         res.status(200).send(return_data);
    //         clearInterval(intervalID);
    //         return;
    //     }
    //     else
    //     {
    //         // waiting for 20s exit
    //         return_data.statusCode = statusCode.RenderingUMLSequenceChart;
    //         // res.status(200).send(return_data);
    //     } 
    // }, 1000);
    
});

// Define the request's url and its response 
// Route to load the sample method
// Read CSV file at server and call the fileNameWithPath() to process the record
// "/loadServerCSV": url of this method
// req: requst from the client
// res: response to the client
// return: None
router.get('/loadServerCSV/:filename', function(req, res) 
{
    let csv_file_name = req.params.filename;

    var cnt = 0; // delay times
    return_data.RendnderAllUMLSequenceChartCompleted[0] = false;
    return_data.RendnderAllUMLSequenceChartCompleted[1] = false;
      
    // construct the CSV file name
    // let fileNameWithPath = path.join(__dirname, )
    let fileNameWithPath = path.join(__dirname,'..', 'public', 'sample_data', csv_file_name)
    // call the ecomploggingMain() to process CSV file
    // input
    //     - strFileNameWithPath: submited file name with path
    //     - loadMode: 0: submited a new CSV file, 1: submited a existing PlantUML file
    // return: 
    //     - return_data obj

    let directory  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/' );


    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      });
    randomName = Math.round(Math.random()*1000);
    // console.log(randomName);
    return_data = ecomplogging.ecomploggingMain(fileNameWithPath, fileLoadMode.loadCSVFile, randomName);

    if (return_data.statusCode == statusCode.EmptyFile)
    {
        // CSV file is empty
        res.status(200).send(return_data);
        return;
    }

    return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
    console.log(return_data)
    res.status(200).send(return_data);

    // Set a interval timer
    // intervalID = setInterval(function()
    // { 
    //     if (return_data.RendnderAllUMLSequenceChartCompleted[0] && return_data.RendnderAllUMLSequenceChartCompleted[1])
    //     {
    //         // Original and processed UML sequence chart are generated
    //         return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
    //         res.status(200).send(return_data);
    //         clearInterval(intervalID);
    //         return;

    //     }
    //     // else wait 1000 ms
    //     cnt++;
    //     if (cnt >=100)
    //     {
    //         // waiting for 20s exit
    //         return_data.statusCode = statusCode.RendnderAllUMLSequenceChartFailed;
    //         res.status(200).send(return_data);
    //         clearInterval(intervalID);
    //         return;
    //     }
    //     else
    //     {
    //         // waiting for 20s exit
    //         return_data.statusCode = statusCode.RenderingUMLSequenceChart;
    //         // res.status(200).send(return_data);
    //     } 
    // }, 1000);
    
});



// Route to read PlantUML method. 
// Read PlantUML file from client
// Render UML sequence chart and save into the server.
// "/readPUML": url of this page
// upload.array('file'): PlantUML file posted by the client
// req: requst from the client
// res: response to the client
// return: status ("empty" - a empty CSV file, "success" - generated UML sequence successful)
router.post('/loadPlantUMLFile', uploadPUML.array('file'), function(req, res) 
{
    var cnt = 0; // delay times

    // Check if PlantUML file is invalid
    if (!req.files || Object.keys(req.files).length === 0) 
    {
        res.status(400).send('pls select a file to upload！');
        return;
    }
      
    // construct the PlantUML file name
    let filenameWithPath = path.join(__dirname,'../', req.files[0].path)

    // call readPUMLfile function
    // input
    //     - strFileNameWithPath: submited file name with path
    //     - filenameWithoutPathSplit: 0: submited a new CSV file, 1: submited a existing PlantUML file
    // return: 
    //     - return_data obj
    return_data = ecomplogging.ecomploggingMain(filenameWithPath, fileLoadMode.loadPlantUMLFile);

    if (return_data.statusCode == statusCode.EmptyFile)
    {
        // CSV file is empty
        res.status(200).send(return_data);
        return;
    }
    return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
    res.status(200).send(return_data);

    // Set a interval timer
    // intervalID = setInterval(function()
    // { 
    //     if (return_data.statusCode == statusCode.RendnderAllUMLSequenceChartCompleted)
    //     {
    //         // Original and processed UML sequence chart are generated
    //         res.status(200).send(return_data);
    //         clearInterval(intervalID);
    //         return;

    //     }
    //     // else wait 1000 ms
    //     cnt++;
    //     if (cnt >=1)
    //     {
    //         // waiting for 20s exit
    //         return_data.statusCode = statusCode.RendnderAllUMLSequenceChartFailed;
    //         res.status(200).send(return_data);
    //         clearInterval(intervalID);
    //         return;
    //     }
    //     else
    //     {
    //         // waiting for 20s exit
    //         return_data.statusCode = statusCode.RenderingUMLSequenceChart;
    //         // res.status(200).send(return_data);
    //     } 
    // }, 1000);

});


// Route to read downloadOriginalPlantUMLFile method. 
router.get('/downloadOriginalPlantUMLFile/:filename',function(req,res,next)
{
    let strFileNameWithPath = req.params.filename;
    // Get PlantUML file name without path
    let strFileNameWithoutPath = path.basename(strFileNameWithPath);
    // Get PlantUML file name without extention
    let strFileNameWithoutExt = strFileNameWithoutPath.substring(0, strFileNameWithoutPath.lastIndexOf('.'));
    // Set PlantUML file name
    // let strOriginalPlantUMLFileName  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/', strFileNameWithoutExt + '_originalPlantUML.puml' );
    let strOriginalPlantUMLFileName  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/', strFileNameWithoutExt + "_" +randomName + '_originalPlantUML.puml' );

    // folderName = './public/generated_files/PlantUML_scripts/audit_log_records_originalPlantUML.puml';
    res.download(strOriginalPlantUMLFileName);
});

// Route to read downloadProcessedPlantUMLFile method. 
router.get('/downloadProcessedPlantUMLFile/:filename',function(req,res,next)
{
    let strFileNameWithPath = req.params.filename;
    // Get PlantUML file name without path
    let strFileNameWithoutPath = path.basename(strFileNameWithPath);
    // Get PlantUML file name without extention
    let strFileNameWithoutExt = strFileNameWithoutPath.substring(0, strFileNameWithoutPath.lastIndexOf('.'));
    // Set PlantUML file name
    // let strProcessedPlantUMLFileName  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/',strFileNameWithoutExt + '_processedPlantUML.puml');

    let strProcessedPlantUMLFileName  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/',strFileNameWithoutExt + "_" + randomName + '_processedPlantUML.puml');
    // config.console(strProcessedPlantUMLFileName);
    res.download(strProcessedPlantUMLFileName);
});

// Route to read downloadOriginalUMLSequenceChart method. 
router.get('/downloadOriginalUMLSequenceChart/:filename',function(req,res,next)
{
    let strFileNameWithPath = req.params.filename;
    // Get UML sequence chart file name without path
    let strFileNameWithoutPath = path.basename(strFileNameWithPath);
    // Get UML sequence chart file name without extention
    let strFileNameWithoutExt = strFileNameWithoutPath.substring(0, strFileNameWithoutPath.lastIndexOf('.'));

    // Set UML sequence chart file name
    let strOriginalUMLSequenceChartFileName  = path.join(__dirname,'../public/generated_files/UML_sequence_charts/', strFileNameWithoutExt + '_originalUMLSequenceChart.svg')

    res.download(strOriginalUMLSequenceChartFileName);   
});

// Route to read downloadProcessedUMLSequenceChart method. 
router.get('/downloadProcessedUMLSequenceChart/:filename',function(req,res,next)
{
    let strFileNameWithPath = req.params.filename;
    // Get UML sequence chart file name without path
    let strFileNameWithoutPath = path.basename(strFileNameWithPath);
    // Get UML sequence chart file name without extention
    let strFileNameWithoutExt = strFileNameWithoutPath.substring(0, strFileNameWithoutPath.lastIndexOf('.'));

    // Set UML sequence chart file name
    let strProcessedlUMLSequenceChartFileName  = path.join(__dirname,'../public/generated_files/UML_sequence_charts/', strFileNameWithoutExt + '_processedUMLSequenceChart.svg')

    res.download(strProcessedlUMLSequenceChartFileName); 
});

// Route to read downloadExistingUMLSequenceChart method. 
router.get('/downloadExistingUMLSequenceChart/:filename',function(req,res,next){
    let strFileNameWithPath = req.params.filename;
    // Get UML sequence chart file name without path
    let strFileNameWithoutPath = path.basename(strFileNameWithPath);
    // Get UML sequence chart file name without extention
    let strFileNameWithoutExt = strFileNameWithoutPath.substring(0, strFileNameWithoutPath.lastIndexOf('.'));

    // Set UML sequence chart file name
    let strExistingUMLSequenceChartFileName  = path.join(__dirname,'../public/generated_files/UML_sequence_charts/', strFileNameWithoutExt + '_UMLSequenceChart.svg')

    res.download(strExistingUMLSequenceChartFileName);
});

router.get('/samplefiles', (req, res)=>{
    // console.log(__dirname)
    filenames =[];
    let paths = path.join(__dirname,'..', 'public', 'sample_data')

      fs.readdirSync(paths).forEach(file => {
        // console.log(file);
        filenames.push(file)
      });

    res.status(200).send(filenames);
})

// export all the routes
// server.js can import these routes
module.exports = router;