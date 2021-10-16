 /* Jeffrey's code
    Verion 1.0
    Create Date: 06/10/2021 - added the readSCV() function
    Create Date: 06/12/2021 - added parseData() function
    Update Date: 06/14/2021 - added the filterByAudit() function
    Update Date: 06/17/2021 - added the export_csv() function
 */

// Import libs
var fs = require('fs');
var express = require('express');
const ObjectsToCsv = require('objects-to-csv');
var path = require('path');
plantuml = require('node-plantuml');

// Import ecomlogging.js
var pathEcomplogging = path.join(__dirname,'../routes/ecomplogging.js')
console.log(pathEcomplogging);

var ecomplogging = require(pathEcomplogging);


const rowDelimiter = "\n"; // Define the key words for splitting whole table into multiple rows
const feildsDelimiter = ","; // Define the key words for splitting one row into multiple fields


/* Define 1d array including the headers of each col in the CSV file */
const arrayHeader = ["index", "requestID", "timestamp", "servicename", "partnername", "sourcetype", "LYNKIT"];

// Define the const which stores the col index of the records in the CSV file
const colComponentIndex = 0;
const colRequestIDIndex = 1;
const colTimestamp = 2;
const colservicenameIndex = 3;
const colPartnernameIndex = 4;
const colSourceTypeIndex = 5;
const colLYNKITIndex =6 ;

const colSenderIndex = colLYNKITIndex; // Define the col index of the sender
const colReceiverIndex = colComponentIndex; // Define the col index of the receiver


/* Function: export_csv() - generate a new csv file 
    arrayHeader: array header
    arrayData: array content
    rowDelimiter: key words for split one row into multiple rows
    fieldsDelimiter: key words for split one row into multiple fields
    fileName: CSV file name
    return: None
*/
const export_csv = (arrayHeader, arrayData, rowDelimiter, fieldsDelimiter, fileName) => 
{
    let header = arrayHeader.join(fieldsDelimiter) + rowDelimiter; // Get CSV file header
    let csv = header;
    arrayData.forEach( array => {
        csv += array.join(fieldsDelimiter) + rowDelimiter; // convert 2d array to CSV file
    });

    // Below code is to save the generated CSV file
    let csvData = new Blob([csv], { type: 'text/csv' });  
    let csvUrl = URL.createObjectURL(csvData);

    let hiddenElement = document.createElement('a');
    hiddenElement.href = csvUrl;
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName;
    hiddenElement.click();
}

/* Function: export_csv() - generate a new csv file 
    arrayHeader: array header
    arrayData: array content
    rowDelimiter: key words for split one row into multiple rows
    fieldsDelimiter: key words for split one row into multiple fields
    fileName: CSV file name
    return: None
*/
const export2csv = (arrayData, fileName) => 
{
    let csv = [];
    arrayData.forEach( array => {
        csv += array.join(feildsDelimiter) + rowDelimiter; // convert 2d array to CSV file
    });

    // const writeStream = fs.createWriteStream('data.csv');
    // const writeStream = fs.createWriteStream('data.csv');
    fs.writeFile(fileName, csv, (err) => {
        console.log(err || "done");
    });
}

// For testing, used in node server page
/* Funcion: save2CSV - save 2d array to CSV file
   array: array to save
   fileName: CSV file name
   return: None 
   */
  function save2CSV(array, fileName)
  {
    (async () => {
        const csv = new ObjectsToCsv(array);
        // Save to file:
        await csv.toDisk(fileName);
               
        // Return the CSV file as string:
        console.log(await csv.toString());
      })();
  }

// For testing, used in client web page
/* Funcion: readCSV - Read CSV file from web page and parse data to a 2d array
   input: HTML file obj
   return: None 
   */
readCSV = function readCSV(input) 
   {
   
       // Use if statement to check if the input file is valid or not
       if (input.files && input.files[0])
       {
           // If input file is valid then read the CSV file into the 2d array
           let reader = new FileReader(); // Create new file reader obj 
           reader.readAsBinaryString(input.files[0]); // Read data as binary string from input file 
           reader.onload = function (e) // Call this callback function when the data of CSV file is loaded into reader
           {
               obj_csv.dataFile = e.target.result // Get all CSV data
               
               // Call the parseData function: Split CSV data into multiple rows and fields based on CSV file format. 
               // csvArray is a 2d array.
               csvArray = parseData(obj_csv.dataFile, feildsDelimiter, rowDelimiter) 
   
               //Call the LNR function to remove the noises and save to a new CSV file
               LNR(csvArray);
           } 
       } 
       else // If the loaded file is invalid then output the error message
       {
           document.getElementById("respons").innerHTML = "Wrong file"; // Display a msg "Wrong file" on the web page
       }
   }


/** Get working dir and file save dir */
function getSaveFileDir(fileSaveDirRelativePath)
{
    let js = document.scripts;
    url =js[js.length - 1].src;
    currentDir = url.substring(0, url.lastIndexOf('/'));
    currentDir = currentDir.substring(0, currentDir.lastIndexOf('/'));
    fileSaveDir = currentDir + "/" +fileSaveDirRelativePath;
}


function getColbyIndex(data, indexID){
    let dataTarget = data.map(function(value,index) { return value[indexID]; });
    dataTarget =dataTarget.slice(1,dataTarget.length)
    return dataTarget;
}

//remove repeated data from array
//data: array, col: col index, csv: output csv file name
//return: array
function removeRepeated(data, col, ex){
    var uniques = [];
    var itemsFound = {};
    for(var i = 0, l = arr.length; i < l; i++) {
        var stringified = JSON.stringify(arr[i]);
        if(itemsFound[stringified]) { continue; }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
    // var names = ["Mike","Matt","Nancy","Adam","Jenny","Nancy","Carl"];
    // var uniqueNames = [];
    // $.each(names, function(i, el){
    // if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    // });
}

//remove repeated data from array
//data: array, col: col index, csv: output csv file name
//return: array
function getUniq(data, col){
    let dataArr = getColbyIndex(data, col);
    let unique = dataArr.filter((item, i, ar) => ar.indexOf(item) === i);
    console.log(unique);
    return unique;

}

function multiDimensionalUnique(arr) {
    var uniques = [];
    var itemsFound = {};
    for(var i = 0, l = arr.length; i < l; i++) {
        var stringified = JSON.stringify(arr[i]);
        if(itemsFound[stringified]) { continue; }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
}

function printData(data){
    for (x in data){
        for (y in data[x]){
            console.log(data[x][y])
        }
    }
}

function write2CSV(data){
    document.write(data.join(", "));
}

/* Function: renderUMLSequenceChart() - Generate and save UML sequence chart
    originalPlantUMLFile: Original PlantUML script path
    processedPlantUMLFile: Processed PlantUML script path
    filenameWithoutPathSplit: CSV file name
    return: status ("empty" - a empty PlantUML file, "success" - generated UML sequence successful)
*/
function rUMLSequenceChart(originalPlantUMLFile, OriginalBMPFile)
{
    // Render UML sequence chart
    let OriginalGen = plantuml.generate(originalPlantUMLFile, {format: 'svg'});
    OriginalGen.out.pipe(fs.createWriteStream(OriginalBMPFile));
    // Render UML sequence chart for a PlantUML file based a lib of node-plantUML

}

function generateInterResult(arrayLogRecord, arrayFiltered, arrayRemovedInternalLogs, arrayRemoveRedundantLogs,arrayAggregatesInterComponentLogs)
{
    for(i = 0, j = arrayLogRecord.length; i<j; i++)
    {
        arrayRow = arrayLogRecord[i]; // Get the data of row[i]
        arrayRow[colSourceTypeIndex] = arrayRow[colSourceTypeIndex].trim();
        // arrayRow[colSourceTypeIndex] = arrayLogRecord[colSourceTypeIndex] .replace(/(\r\n|\n|\r)/gm, "");
    }
    
    let fileName  = path.join(__dirname,'../testing/auditLogRecordsWithSender.csv');
    export2csv(arrayLogRecord, fileName);

    // Set PlantUML script title
    let plantUMLTitle = 'title Audit Log Reocrds with Sender Name';
    // Set PlantUML file name

    // Call the generatePlantUMLfile() function to generate PlantUML script for processed log records
    let plantUmlScript = ecomplogging.generatePlantUMLScript(arrayLogRecord, plantUMLTitle)

    // Set PlantUML file name
    fileName  = path.join(__dirname,'../testing/auditLogRecordsWithSender.puml');
    // Save the Original PlantUML script to the file
    fs.writeFileSync(fileName, plantUmlScript.toString());

    let UMLSequenceChartFileName  = path.join(__dirname,'../testing/auditLogRecordsWithSender.svg')
    rUMLSequenceChart(fileName, UMLSequenceChartFileName);



    ///////
    fileName  = path.join(__dirname,'../testing/filterByAudit.csv');
    export2csv(arrayFiltered, fileName);

    // Set PlantUML script title
    plantUMLTitle = 'title filter By Audit';
    // Set PlantUML file name

    // Call the generatePlantUMLfile() function to generate PlantUML script for processed log records
    plantUmlScript = ecomplogging.generatePlantUMLScript(arrayFiltered, plantUMLTitle)

    // Set PlantUML file name
    fileName  = path.join(__dirname,'../testing/filterByAudit.puml');
    // Save the Original PlantUML script to the file
    fs.writeFileSync(fileName, plantUmlScript.toString());

    UMLSequenceChartFileName  = path.join(__dirname,'../testing/filterByAudit.svg')
    rUMLSequenceChart(fileName, UMLSequenceChartFileName);


    ///////
    fileName  = path.join(__dirname,'../testing/internalProcessed.csv');
    export2csv(arrayRemovedInternalLogs, fileName);

    // Set PlantUML script title
    plantUMLTitle = 'title inter processing';
    // Set PlantUML file name

    // Call the generatePlantUMLfile() function to generate PlantUML script for processed log records
    plantUmlScript = ecomplogging.generatePlantUMLScript(arrayRemovedInternalLogs, plantUMLTitle)

    // Set PlantUML file name
    fileName  = path.join(__dirname,'../testing/internalProcessed.puml' );
    // Save the Original PlantUML script to the file
    fs.writeFileSync(fileName, plantUmlScript.toString());

    UMLSequenceChartFileName  = path.join(__dirname,'../testing/internalProcessed.svg')
    rUMLSequenceChart(fileName, UMLSequenceChartFileName);



    /////
    fileName  = path.join(__dirname,'../testing/removeredundantLogs.csv');
    export2csv(arrayRemoveRedundantLogs, fileName);

    // Set PlantUML script title
    plantUMLTitle = 'title Remove redundant Logs';
    // Set PlantUML file name

    // Call the generatePlantUMLfile() function to generate PlantUML script for processed log records
    plantUmlScript = ecomplogging.generatePlantUMLScript(arrayRemoveRedundantLogs, plantUMLTitle)

    // Set PlantUML file name
    fileName  = path.join(__dirname,'../testing/removeredundantLogs.puml' );
    // Save the Original PlantUML script to the file
    fs.writeFileSync(fileName, plantUmlScript.toString());

    UMLSequenceChartFileName  = path.join(__dirname,'../testing/removeredundantLogs.svg')
    rUMLSequenceChart(fileName, UMLSequenceChartFileName);

    //////
    fileName  = path.join(__dirname,'../testing/aggregateInterComponentLogs.csv');
    export2csv(arrayAggregatesInterComponentLogs, fileName);

    // Set PlantUML script title
    plantUMLTitle = 'title Aggregate Inter Component Logs';
    // Set PlantUML file name

    // Call the generatePlantUMLfile() function to generate PlantUML script for processed log records
    plantUmlScript = ecomplogging.generatePlantUMLScript(arrayAggregatesInterComponentLogs, plantUMLTitle)

    // Set PlantUML file name
    fileName  = path.join(__dirname,'../testing/aggregateInterComponentLogs.puml' );
    // Save the Original PlantUML script to the file
    fs.writeFileSync(fileName, plantUmlScript.toString());

    UMLSequenceChartFileName  = path.join(__dirname,'../testing/aggregateInterComponentLogs.svg')
    rUMLSequenceChart(fileName, UMLSequenceChartFileName);
}

// export readCSVNodeJS and readPUMLfile function
// routes_ecomplogging.js can import these routes
exports.export2csv = export2csv;
exports.generateInterResult = generateInterResult;

