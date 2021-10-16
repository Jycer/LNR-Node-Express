 /* Jeffrey's code
    Version 1.0
    Create Date: 06/10/2021 - added the readCSVFile() function: read CSV file from client side
    Create Date: 06/12/2021 - added parseData() function
    Update Date: 06/14/2021 - added the filterByAudit() function
    Update Date: 06/17/2021 - added the export_csv() function
    Update Date: 06/19/2021 - added the filterByAudit() function
    Update Date: 06/20/2021 - added the internalProcessingLogRemover() function
    Update Date: 06/21/2021 - added new redundantLogsRemover() function
    Update Date: 06/24/2021 - modified the comments of redundantLogsRemover() function
    Update Date: 06/28/2021 - added the aggregateInterComponent() function
    Update Date: 07/02/2021 - added the generatePlantUML() function
    Update Date: 07/03/2021 - Modified readCSVFile() function: read CSV file from server side
    Update Date: 07/05/2021 - added the savePlantUMLfile() function
    Update Date: 07/07/2021 - added the renderUMLSequenceChart() function
    Update Date: 07/08/2021 - added the readPlantUMLfile() function
    Update Date: 07/10/2021 - removed all the testing code to the ecomplogging_testing.js
    Update Date: 07/10/2021 - added the ecomploggingMain() function
    Update Date: 07/11/2021 - Modified the LNR function
    Update Date: 07/11/2021 - added the OS mode obj
    Update Date: 07/22/2021 - added new function preProcessLogRecords()
    Update Date: 07/22/2021 - added new function extractSenderName()
    Update Date: 07/22/2021 - added new function determineOpenstackReceiver()
    Update Date: 07/25/2021 - Modified the function extractSenderName()
    Update Date: 07/25/2021 - added new function arraySort()
    Update Date: 07/28/2021 - Updated the function extractSenderName()
    Update Date: 07/28/2021 - Updated the function generatePlantUML()    
    
 */

// Import libs
var fs = require('fs');
var path = require('path');
// plantuml = require('node-plantuml');

// ************** For testing **************
// ture: testing and will generate intermediate result. 
var isTesting = false;
if (isTesting)
{
    var pathEcomploggingTesting = path.join(__dirname,'../testing/ecomplogging_testing.js')
    var ecomploggingTesting = require(pathEcomploggingTesting); 
}
// ************** For testing end **************


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

const keywordForfilterByAudit = "metrics"; // Define the key words for filter by audit
const colSenderIndex = colLYNKITIndex; // Define the col index of the sender
const colReceiverIndex = colComponentIndex; // Define the col index of the receiver
const filterByAuditCSVFileName = "filterbyaudit.csv"; // Define the CSV file name for saving log records after fitlered by audit
const internalProcessedFileName = "internalprocessed.csv"; // Define the CSV file name for saving log records after removing internal preccesing
const removeredundantLogsFileName = "removedredundantlogs.csv"; // Define the CSV file for saving log records after removing redundant logs
const aggregateInterComponentLogsFileName = "aggregateInterComponentLogs.csv"; // Define the CSV file for saving log records after aggregate inter component logs
const originalCSVFileName = "aggregateInterComponentLogs.csv"
const processedCSVFileName = "aggregateInterComponentLogs.csv"


const rowDelimiter = "\n"; // Define the key words for splitting whole table into multiple rows
const feildsDelimiter = ","; // Define the key words for splitting one row into multiple fields

//componentName and alias name for sequence diagram
const componentName = ["LYNKIT", "MSO", "AAI", "SDNCP", "OPENSTACK", "PINC", "NARAD"];
// const componentName = ["LYNKIT_VID", "MSO", "AAI", "SDNCP", "SDNGP", "APPC", "CCD", "SNIRO", "TESTPDP", "OPENSTACK", "PINC", "NARAD", "APPC", "PEF"];

var originalPlantUMLTitle = "title Original UML Sequence Chart"; // plantUML diagram title
let originalPlantUMLFileName = "originalPlantUML.puml"; // export original plantUML file 

var processedPlantUMLTitle = "title Processed UML Sequence Chart"; // plantUML diagram title
const processedPlantUMLFileName = "processedPlantUML.puml"; // export original plantUML file 


const filterByAuditPlantUMLTitle = "title Sequence Diagram after Fitered by Audit"; //plantUML diagram title
const filterByAuditPlantUMLFileName = "filterByAuditPlantUML.puml"; // export plantUML file after filtering by audit

const removeInternalProcessedPlantUMLTitle = "title Sequence S after Removing Internal Processing Logs"; // export plantUML file after removing internal processing logs
const removeInternalProcessedPlantUMLFileName = "removedInternalProcessedPlantUML.puml"; // export plantUML file after removing internal processing logs

const removeredundantLogsPlantUMLTitle = "title Sequence Chart after Removing Reduntent Logs"; // plantUML diagram title
const removeredundantLogsPlantUMLFileName = "removedredundantLogsPlantUML.puml"; // export plantUML file after removing redundant logs

const aggregateInterComponentLogsPlantUMLTitle = "title Sequence Chart after Aggregate Inter Component"; // plantUML diagram title
const aggregateInterComponentLogsPlantUMLFileName = "aggregateInterComponentLogsPlantUML.puml"; // export plantUML file after removing redundant logs

const statusCode = {
    "EmptyFile": 0,
    "FileReadSuccess": 1,
    "RendnderOriginalUMLSequenceChartCompleted": 2,
    "RendnderProcessedUMLSequenceChartCompleted": 3,
    "RendnderAllUMLSequenceChartCompleted": 4,
    "RendnderOriginalUMLSequenceChartFailed": 5,
    "RendnderProcessedUMLSequenceChartFailed": 6,
    "RendnderAllUMLSequenceChartFailed": 7,
    "RenderingUMLSequenceChart": 8,
  }

/* Define the obj to store the data loaded from CSV file */
var obj_csv = 
{
    dataFile:[] // Orignal data loaded from the CSV file
};

// Define the return_data obj which will send back to the client
var return_data =
{
    "statusCode": 0, // system status
    "timeStamp": "", // timestamp when generating UML sequence chart
    "RendnderAllUMLSequenceChartCompleted": [false, false], // if all UML_sequence_charts are generated
}

// Define the obj of file load mode
var fileLoadMode = {
    "loadCSVFile": 0,
    "loadPlantUMLFile": 1,
}

var requestID = "";
// var randomName = "";

/*  Function: ecomploggingMain - Main function of LNR algorithm
    input
        - strFileNameWithPath: submited file name with path
        - loadMode: 0: submited a new CSV file, 1: submited a existing PlantUML file
    return: 
        - return_data obj

    This function call the following functions
    For a new CSV file:
    - readCSVFile(): read a new CSV file and parse it to a 2d array
    - LNR(): apply the LNR algorithm to the 2d array
    - generatePlantUMLScript(): generate PlantUML script
    - savePlantUMLfile(): Save PlantUML script to the files
    - renderUMLSequenceChart(): render and save UML sequence chart
    For an existing PlantUML file:
    - readPlantUMLFile: read an existing PlantUML file and parse it to a string
    - renderUMLSequenceChart(): Display and save UML sequence chart
   */
ecomploggingMain = function ecomploggingMain(strFileNameWithPath, loadMode, randomName)
{
    var arrayOriginalData; // Define an array to store original log record
    return_data.statusCode = statusCode.EmptyFile; // Init status to empty file

    // Get CSV file name without path
    let strFileNameWithoutPath = path.basename(strFileNameWithPath);
    // Get CSV file name without extention
    let strFileNameWithoutExt = strFileNameWithoutPath.substring(0, strFileNameWithoutPath.lastIndexOf('.'));
    
    // Set PlantUML script title
    let originalPlantUMLTitleNew = originalPlantUMLTitle + ' (' +strFileNameWithoutPath +')';
    let processedPlantUMLTitleNew = processedPlantUMLTitle + ' (' +strFileNameWithoutPath +')';

    // var millisecondsTimeStamp = new Date().getTime();
    

    // Set PlantUML file name
    let strOriginalPlantUMLFileName  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/', strFileNameWithoutExt + "_" +randomName + '_originalPlantUML.puml' );
    let strProcessedPlantUMLFileName  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/',strFileNameWithoutExt + "_" +randomName + '_processedPlantUML.puml');
  
    // let strOriginalPlantUMLFileName  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/', strFileNameWithoutExt + '_originalPlantUML.puml' );
    // let strProcessedPlantUMLFileName  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/',strFileNameWithoutExt + '_processedPlantUML.puml');
  
    
    // Set UML sequence chart file name
    let strOriginalUMLSequenceChartFileName  = path.join(__dirname,'../public/generated_files/UML_sequence_charts/', strFileNameWithoutExt + '_originalUMLSequenceChart.svg')
    let strProcessedlUMLSequenceChartFileName  = path.join(__dirname,'../public/generated_files/UML_sequence_charts/', strFileNameWithoutExt + '_processedUMLSequenceChart.svg')
    let strExistingUMLSequenceChartFileName  = path.join(__dirname,'../public/generated_files/UML_sequence_charts/', strFileNameWithoutExt + '_UMLSequenceChart.svg')
    
    // Check if need to process a new CSV file or a existing PlantUML file
    if (loadMode == fileLoadMode.loadCSVFile)
    {
        // A new CSV file
        // Call readCSVFile() to read CSV file and parse it to a 2d array: arrayOriginalData
        arrayOriginalData = readCSVFile(strFileNameWithPath);

        // Check if CSV file is empty
        if (return_data.statusCode == statusCode.EmptyFile)
        {
            // CSV file is empty. Do not process it.
            return return_data;
        }

        // Call sortArray function to sort the log records based on the timestamp column
        var beginTime = + new Date();
        sortedLogRecords =  sortArray(arrayOriginalData);
        var endTime = +  new Date();
        console.log("sort time:" + (endTime-beginTime) + "ms")

        // Call the preProcessLogRecords function: generate sender name and process receiver name
        // return the processed log record with the sender name and processed reciever name
        arrayOriginalDataWithSender =  preProcessLogRecords(sortedLogRecords);
        
        // Call the LNR function: apply the LNR algorithm to the original log records (arrayOriginalData)
        // return the processed log record stored in a 2d array (arrayProcessedData)
        var beginTime = + new Date();
        arrayProcessedData = LNR(arrayOriginalDataWithSender);
        var endTime = +  new Date();
        console.log("LNR time:" + (endTime-beginTime) + "ms")

        var beginTime = + new Date();
        // Call the generatePlantUMLfile() function to generate PlantUML script for original log records
        arrayOriginalPlantUmlScript = generatePlantUMLScript(arrayOriginalDataWithSender, originalPlantUMLTitleNew, strFileNameWithoutPath, 0)

        // Call the generatePlantUMLfile() function to generate PlantUML script for processed log records
        arrayProcessedPlantUmlScript = generatePlantUMLScript(arrayAggregatesInterComponentLogs, processedPlantUMLTitleNew, strFileNameWithoutPath, 1)
        var endTime = +  new Date();
        console.log("Generate UML Script:" + (endTime-beginTime) + "ms")

        // Save the Original PlantUML script to the file Math.random()
        fs.writeFileSync(strOriginalPlantUMLFileName, arrayOriginalPlantUmlScript.toString());

        // Save the processed PlantUML script to the file
        fs.writeFileSync(strProcessedPlantUMLFileName, arrayProcessedPlantUmlScript.toString());

        // Call the renderUMLSequenceChart() function to render and save UML sequence chart for original log records
        return_data = renderUMLSequenceChartStdin(arrayOriginalPlantUmlScript.toString(), strOriginalPlantUMLFileName, strOriginalUMLSequenceChartFileName, 0);

        // Call the renderUMLSequenceChart() function to render and save UML sequence chart for processes log records
        return_data = renderUMLSequenceChartStdin(arrayProcessedPlantUmlScript.toString(), strProcessedPlantUMLFileName, strProcessedlUMLSequenceChartFileName, 1);

        return return_data;

    }
    else if (loadMode == fileLoadMode.loadPlantUMLFile)
    {
        // doing
        // A PlantUML file
        // Call readCSVFile() to read CSV file and parse it to a 2d array: arrayOriginalData
        // return_data = readPlantUMLFile(strFileNameWithPath);

        // Call the renderUMLSequenceChart() function to render and save UML sequence chart for original log records
        return_data = renderUMLSequenceChart(strFileNameWithPath, strExistingUMLSequenceChartFileName, 2);
        
        return return_data;
    }
}

/* Function: sortArray() - sort log records based on timestamp 
    input
        - array: log record before sorting
    return: 
        - sorted array
*/
function sortArray(array)
{
    let i, j, arrayNewRecord = [], arrayRow;
    let arrayLen = array.length;

    arrayNewRecord.push(array[0]); // Push the first row (header) of the original log records to a new array (hash)

    // Check if log file have 1 or 2 records
    if (arrayLen == 1 || arrayLen == 0)
    {
        // return array
        return arrayNewRecord;
    }

    // Go through all the orignal log records
    // Convert timestamp string to integer value
    for(i =  1, j = array.length; i<j; i++)
    {
        arrayRow = array[i]; // Get the data of row[i]

        // Convert timestamp string to integer value for the current records
        arrayRow[colTimestamp] = new Date(arrayRow[colTimestamp]).getTime();  
    
        arrayNewRecord.push(arrayRow); // Push the current log records to a new array
    }

    // Sort original log records based on the timestamp column
    arrayNewRecord.sort( function(a, b) {
        return (a[colTimestamp] - b[colTimestamp]);
      });

    return arrayNewRecord; // Return the sorted array with filtered log records
}


/* Funcion: readCSVFile - Read CSV file from web page and parse data to a 2d array
   intput:
        - strFileNameWithPath: CSV file name with path
   return: 
        - arrayLogRecord: 2d array stored the log records
   */
readCSVFile= function readCSVFile(strFileNameWithPath) 
{
    // Define a empty array to store the log record readed from CSV file
    var arrayLogRecord;
    
    obj_csv.dataFile = fs.readFileSync(strFileNameWithPath).toString() // convert Buffer to string
    
    // If CSV file is empty, return
    if (obj_csv.dataFile.length ==0)        
    {
        // Set status to emptyfile
        return_data.statusCode = statusCode.EmptyFile;
        return "";
    }
    
    // Call parseData function: Split CSV data into multiple rows and fields based on CSV file format. 
    arrayLogRecord = parseData(obj_csv.dataFile, feildsDelimiter, rowDelimiter) 
        
    // Set status to the FileReadSuccess
    return_data.statusCode = statusCode.FileReadSuccess
    
    return arrayLogRecord;
}

/* Funcion: readPUMLfile - Read PlantUML file from web page and parse data to a 2d array - server side
   filenameWithoutPath: PlantUML file name without path
   filenameWithoutPathSplit: PlantUML file name without extension
   return: status ("empty" - a empty PlantUML file, "success" - generated UML sequence successful)
*/
readPlantUMLFile= function readPlantUMLFile(strFileNameWithPath, filenameWithoutPathSplit) 
   {   
        var loadedPlantUMLScript = fs.readFileSync(strFileNameWithPath).toString() // convert Buffer to string

       // If PlantUML file is empty, reture the msg to client
       if (loadedPlantUMLScript.length ==0)
       {
           // Set status to emptyfile
            return_data.statusCode = statusCode.EmptyFile;
            return "";
       }

       // Define the PlantUML file name
        let PlantUMLFile  = path.join(__dirname,'../public/generated_files/PlantUML_scripts/', filenameWithoutPathSplit + '.puml');
    
        // Call the renderUMLSequenceChart() function to display and save UML sequence chart
        let status = renderUMLSequenceChart(originalPlantUMLFile, "", filenameWithoutPathSplit);

        return status;
   }


/* Funcion: preProcessLogRecords - process the original log records, extract sender and filter receiver
   intput:
        - originalLogRecords: original log records
   return: 
        - recordsWithSenderName: log records with sender name
   */
function preProcessLogRecords(originalLogRecords)
{
    let i, j, arrayRow;
    var arrayRecordsWithSenderName = [];

    arrayRecordsWithSenderName.push(originalLogRecords[0]); // Push the first row (header) of the original log records to a new array (hash)

    // Go through all the orignal log records
    // Gernerate sender name and process reciever name
    for(i =  1, j = originalLogRecords.length; i<j; i++)
    {
        arrayRow = originalLogRecords[i]; // Get the data of row[i]

        // call determineOpenstackReceiver() to process receiver name
        receiverName = determineOpenstackReceiver(arrayRow[colReceiverIndex], arrayRow[colPartnernameIndex], arrayRow[colservicenameIndex]);
        if (receiverName !== "")
        {
            arrayRow[colReceiverIndex] = receiverName;
        }
        else
        {
            continue;
        }

        // callextractSenderName to generate sender name
        senderName = extractSenderName(arrayRow[colPartnernameIndex]);
        if (senderName !== "")
        {
            arrayRow[colSenderIndex] = senderName;
        }
        else
        {
            continue;
        }

        arrayRecordsWithSenderName.push(arrayRow); 
       
    }

    return arrayRecordsWithSenderName;

}

/* Funcion: extractSenderName - gernerate sender name based on parnername
    input:
        - strParterName: value in parter name column
   return: 
        - strSenderName: generated sender name
*/
function extractSenderName(strParterName)
{
    var strSenderName = "";
    if (strParterName !== "undefined")
    {
            // Gernerate sender name based on the rules
        if (strParterName.trim().toUpperCase().includes("MSO") || strParterName.trim().toUpperCase().includes("SO."))
        {
            strSenderName = "MSO";
        }
        else if (strParterName.trim().toUpperCase().includes("LYNKIT"))
        {
            strSenderName = "LYNKIT";
        }
        else if (strParterName.trim().toUpperCase().includes("SDNCP"))
        {
            strSenderName = "SDNCP";
        }
        else if (strParterName.trim().toUpperCase().includes("VID."))
        {
            strSenderName = "VID";
        }
        else if (strParterName.trim().toUpperCase().includes("SDNF"))
        {
            strSenderName = "PINC";
        }
        else if (strParterName.trim().toUpperCase().includes("APPC."))
        {
            strSenderName = "APPC";
        }
        else if (strParterName.trim().toUpperCase().includes("GDBGP."))
        {
            strSenderName = "SDNGP";
        }
        else if (strParterName.trim().toUpperCase().includes("CCD."))
        {
            strSenderName = "CCD";
        }
        else if (strParterName.trim().toUpperCase().includes("SNIRO."))
        {
            strSenderName = "SNIRO";
        }
        else if (strParterName.trim().toUpperCase().includes("TESTPDP"))
        {
            strSenderName = "TESTPDP";
        }
        else if (strParterName.trim().toUpperCase().includes("PEF."))
        {
            strSenderName = "PEF";
        }
        else if (strParterName.trim().toUpperCase().includes("STABILITY"))
        {
            strSenderName = "STABILITY_TEST";
        }
        else
        {
            strSenderName = strParterName;
        }
        return strSenderName;
    }
    else
    {
        return "";

    }   
}

/* Funcion: determineOpenstackReceiver - process the receiver name
    input:
        - strOldReceiverName: origianal receiver name
        - strParterName: value in parter name column
        - strServiceName: service name
   return: 
        - strNewReceiverName: processed receiver name
*/
function determineOpenstackReceiver(strOldReceiverName, strPartnerName, strServiceName)
{
    var strNewReceiverName = "";

    if (strOldReceiverName !== "undefined" && strOldReceiverName !== "" && strPartnerName !== "undefined" && strServiceName !== "undefined")
    {
            // gernerate "OPENSTACK"
        if (strPartnerName.trim().toUpperCase().includes("SO.OPENSTACK_ADAPTER") && strServiceName.trim().toUpperCase().includes("OPENSTACKADAPTER"))
        {
            strNewReceiverName = "OPENSTACK";
        }
        else
        {
            strNewReceiverName = strOldReceiverName;
        }

        // gernerate "PINC"
        if (strNewReceiverName.trim().toUpperCase().includes("SDNF"))
        {
            strNewReceiverName = "PINC";

        }

        // remove the "_xxx" from the receiver name. For example: "sdncp_180" -> "sdncp"
        if (strNewReceiverName.lastIndexOf('_') != -1)
        {
            return strNewReceiverName.trim().substring(0, strNewReceiverName.lastIndexOf('_'));
        }
        else
        {
            return strNewReceiverName;
        }
    }
    else
    {
        return "";
    }
}

/* Function: LNR - LNR algorithm 
    input: 
        - arrayLogRecord - 2d array storing the original log records
        The 2d array should follow this structure example (The first row should include headers of the audit log file. And log records should be in the following rows): 
        [["index", "requestID", "timestamp", "servicename",	"partnername", "sourcetype", "LYNKIT"],
         ["mso", "b7281fc8-94bc-4475-91c0-9287f1c06983", "2021-03-28T21:02:49.977Z", "onap/so/infra/serviceInstantiation/v7/serviceInstances/56b1cca1-d22e-4e62-8b00-5ca9b3a71947/vnfs/93946891-427a-4c2d-ae70-327a789daa15/vfModules", "m32058@prod.lynkit.att.com", "domain2:audit", "MSO"]]
    return: 
        - arrayAggregatesInterComponentLogs: 2d array storing the processed log records
    This function call the following functions
    - filterByAudit(): Filter logs by Audit
    - internalProcessingLogRemover(): Remove internal processing logs
    - redundantLogsRemover(): Remove redundant logs
    - aggregatesInterComponentlogRecords(): Aggregate inter component logs
    */
function LNR(arrayLogRecord)
{
    // Call the filterByAudit() function to filter the logs by audit
    // input: original log records (arrayLogRecord)
    // return: filtered log records (arrayFiltered)
    arrayFiltered = filterByAudit(arrayLogRecord);

    // Call the internalProcessingLogRemover() function to remove internal processing log records
    // input: filtered log records (arrayFiltered)
    // return: log records after removing internal processing records (arrayRemovedInternalLogs)
    arrayRemovedInternalLogs = internalProcessingLogRemover(arrayFiltered)

    // Call the redundantLogsRemover() function to remove the redundant log records
    // input: log records after removing internal processing records (arrayRemovedInternalLogs)
    // return: log records after removing redundant records (arrayRemovedInternalLogs)
    arrayRemoveRedundantLogs = redundantLogsRemover(arrayRemovedInternalLogs);

    // Call the aggregatesInterComponentlogRecords() function to remove the redundant log records
    // input: log records after removing internal processing records (arrayRemoveRedundantLogs)
    // return: log records after removing redundant records (arrayAggregatesInterComponentLogs)
    arrayAggregatesInterComponentLogs = aggregatesInterComponentlogRecords(arrayRemoveRedundantLogs);

    // ************** For testing **************
    if (isTesting)
    {
        // Generate new CSV file after filtering by audio by calling iexport_csve function
        // For testing
        ecomploggingTesting.generateInterResult(arrayLogRecord, arrayFiltered, arrayRemovedInternalLogs, arrayRemoveRedundantLogs,arrayAggregatesInterComponentLogs); 
    }
    // ************** For testing end **************

      
    // return the processed 2d array (processed log records)
    return arrayAggregatesInterComponentLogs;
}

/* Funciton: filterByAudit - remove rows having the predefined keywords from original log records 
    input
        - array: original log records
    return: 
        - arrayNewRecord: filtered log records
*/
function filterByAudit(array)
{
    let i, j, arrayNewRecord = [], arrayRow;
    let arrayLen = array.length;

    arrayNewRecord.push(array[0]); // Push the first row (header) of the original log records to a new array (hash)

    // Check if CSV file only contains head
    if (arrayLen == 1)
    {
        // The CSV file only contains head
        return arrayNewRecord;
    }

    // Go through all the orignal log records
    // Remove/Keep the log records that contain the keyword
    // let stri = "sss-sss";
    // let stt = stri.replaceAll("-", "_");
    requestID = array[1][colRequestIDIndex].split("-").join("_");;
    
    for(i =  1, j = array.length; i<j; i++)
    {
        arrayRow = array[i]; // Get the data of row[i]
       
        // Rmove rows containing keyword
        if(typeof arrayRow[colSourceTypeIndex] !== "undefined" && !arrayRow[colSourceTypeIndex].trim().toUpperCase().includes(keywordForfilterByAudit)) // Check if the data of row[i] has the keyword
        {
               arrayNewRecord.push(arrayRow); // Store this row to new array
        }
    }

    return arrayNewRecord; // Return the new array with filtered log records
}

/* Function: internalProcessingLogRemover() - remove internal processing log records
    input
        - array: filtered log records
    return: 
        - arrayNewRecord: log records after removing internal processing records
*/
function internalProcessingLogRemover(array)
{
    let i, j, arrayNewRecord = [], arrayRow;
    let arrayLen = array.length;

    arrayNewRecord.push(array[0]); // Push the first row (header) of the filtered log records to a new array (arrResult)

    // Check if CSV file only contains head
    if (arrayLen == 1)
    {
        // The CSV file only contains head
        return arrayNewRecord;
    }

    // Go through all the filtered log records 
    // Remove/Keep the log records that have the same sender and receiver 
    for(i =  1, j = array.length; i<j; i++) // data is starting from index 1 to array.length (this is the last row)
    {
        arrayRow = array[i]; // Get the data of row[i]

        // Remove the logs if sender == receiver
        if(typeof arrayRow[colSenderIndex] !== "undefined" && typeof arrayRow[colReceiverIndex] !== "undefined" && arrayRow[colSenderIndex].trim().toUpperCase() != arrayRow[colReceiverIndex].trim().toUpperCase())
        {
            arrayNewRecord.push(arrayRow);
        }

    }

    return arrayNewRecord; // Return log records after removing internal processing records
}

/* Function: redundantLogsRemover() - remove redundant log records
    input:
        - array: log records after removing internal processing records
    return:
        - larrayNewRecord: og records after removing redundant records
*/
function redundantLogsRemover(array)
{
    var intFirst, intNext, arrayNewRecord = [];

    intLen = array.length // Number of rows in the array
    
    arrayNewRecord.push(array[0]); // Push the first row (header) of the log records to a new array which is arrResult

    // Check if CSV file only contains head
    if (intLen == 1)
    {
        // The CSV file only contains head
        return arrayNewRecord;
    }
    else if (intLen == 2)
    {
        arrayNewRecord.push(array[1]);
        return arrayNewRecord;
    }

    intFirst = 1; // Index of the first row that is used as a reference for comparison. This row will be put into the new array as the aggragated record.
    intNext = intFirst +1; // Index of the next row compared to the reference (intFirst). If it has the same requestID, interacting components and direction as the reference skip this record.
    

    arrFirstRow = array[intFirst]; // Get the first record
    arrNextRow = array[intNext]; // Get the next record

    // Go through all the log records after removing redundant log records
    // Remove the log records that have the same component name, partner name, service name and requestID.
    while (intFirst < intLen)
    {      
        // Check if the first row and next row have the same component name partner name, service name and requestID
        if (typeof arrFirstRow[colComponentIndex] !== "undefined" && typeof arrNextRow[colComponentIndex] !== "undefined" 
            && typeof arrFirstRow[colservicenameIndex] !== "undefined" && typeof arrNextRow[colservicenameIndex] !== "undefined"
            && typeof arrFirstRow[colRequestIDIndex] !== "undefined" && typeof arrNextRow[colRequestIDIndex] !== "undefined"
            && typeof arrFirstRow[colPartnernameIndex] !== "undefined" && typeof arrNextRow[colPartnernameIndex] !== "undefined" 
            && arrFirstRow[colComponentIndex].trim().toUpperCase() === arrNextRow[colComponentIndex].trim().toUpperCase() 
            && arrFirstRow[colservicenameIndex].trim().toUpperCase() === arrNextRow[colservicenameIndex].trim().toUpperCase() 
            && arrFirstRow[colRequestIDIndex].trim().toUpperCase() === arrNextRow[colRequestIDIndex].trim().toUpperCase() 
            && arrFirstRow[colPartnernameIndex].trim().toUpperCase() === arrNextRow[colPartnernameIndex].trim().toUpperCase())
        {
            // The first row and the next row have the same component name partner name, service name and requestID
            intNext++; // Let the NextRow move to the next record

            if (intNext>=intLen) // Check if the index of the next row will exceed the end of the array
            {
                // All the rows that among the first row and the last row have the same component name partner name, service name and requestID
                arrayNewRecord.push(arrFirstRow); // Push the first row to the new array which is arrResult
                break; // Exit the while loop                  
            }
            arrNextRow = array[intNext]; // Get the net record
        }
        else
        {
            // The first row and next row do not have the same component name partner name, service name and requestID
            arrayNewRecord.push(arrFirstRow); // Push the first row to the new array (arrResult)
            intFirst = intNext; // Let the first row move to the next row
            arrFirstRow = array[intFirst]; // Get the first record

            // The first row and next row do not have the same component name partner name, service name and requestID
            intNext = intFirst + 1; // Let the intNext (next row) move to the next record of the intFirst (first row)

            if (intNext >= intLen) // Check if the index of the intNext (next row) will exceed the end of array 
            { 
                arrayNewRecord.push(arrFirstRow); // Push the first row (last row) to the new array (arrResult)
                break; // Exit the while loop            
            }
            arrNextRow = array[intNext]; // Get the next record

        }
    }

    return arrayNewRecord; // return precessed log records after removing redundant records
}

/* Function: aggregate inter component log records 
    input
        - array: log records after removing redundant records
    return: 
        - arrayNewRecord: log records after aggregating inter component records 
 */
function aggregatesInterComponentlogRecords(array)
{
    var intFirst, intNext, arrayNewRecord = [];

    arrayNewRecord.push(array[0]); // Push the first row (header) of the log records to a new array which is arrResult
    intLen = array.length // Number of rows in the array
    // Check if CSV file only contains head
    if (intLen == 1)
    {
        // The CSV file only contains head
        return arrayNewRecord;
    }
    else if (intLen == 2)
    {
        arrayNewRecord.push(array[1]);
        return arrayNewRecord;
    }

    intFirst = 1; // Index of the first row that is used as a reference for comparison. This row will be put into the new array as the aggragated record.
    intNext = intFirst +1; // Index of the next row compared to the reference (intFirst). If it has the same requestID, interacting components and direction as the reference skip this record.
    

    arrFirstRow = array[intFirst]; // Get the first record
    arrNextRow = array[intNext]; // Get the next record

    // Go through all the log records after removing redundant log records
    // Aggregate the log records that have the same requestID, interacting components and same direction
    while (intFirst < intLen)
    {      
        // Check if the first row and next row have the same requestID, interacting components and same direction
        if (typeof arrFirstRow[colComponentIndex] !== "undefined" && typeof arrNextRow[colComponentIndex] !== "undefined" 
            && typeof arrFirstRow[colLYNKITIndex] !== "undefined" && typeof arrNextRow[colLYNKITIndex] !== "undefined"
            && typeof arrFirstRow[colRequestIDIndex] !== "undefined" && typeof arrNextRow[colRequestIDIndex] !== "undefined"
            && arrFirstRow[colComponentIndex].trim().toUpperCase() === arrNextRow[colComponentIndex].trim().toUpperCase() 
            && arrFirstRow[colLYNKITIndex].trim().toUpperCase() === arrNextRow[colLYNKITIndex].trim().toUpperCase() 
            && arrFirstRow[colRequestIDIndex].trim().toUpperCase() === arrNextRow[colRequestIDIndex].trim().toUpperCase() 
            && arrFirstRow[colComponentIndex].trim().toUpperCase() !== arrFirstRow[colLYNKITIndex].trim().toUpperCase())
        {
            // The first row and the next row have the same requestID, interacting components and same direction
            intNext++; // Let the NextRow move to the next record

            //The first row and next row have the same requestID, interacting components and same direction
            if (intNext>=intLen) // Check if the index of the next row will exceed the end of the array
            {
                // All the rows that among the first row and the last row have the same requestID, interact with 2 component and same direction
                arrayNewRecord.push(arrFirstRow); // Push the first row to the new array which is arrResult
                break; // Exit the while loop                  
            }
            arrNextRow = array[intNext]; // Get the net record
        }
        else
        {
            // The first row and next row do not have the same requestID/interacting components/same direction
            arrayNewRecord.push(arrFirstRow); // Push the first row to the new array (arrResult)
            intFirst = intNext; // Let the first row move to the next row
            arrFirstRow = array[intFirst]; // Get the first record

            // The first row and next row do not have the same requestID/interacting components/same direction
            intNext = intFirst + 1; // Let the intNext (next row) move to the next record of the intFirst (first row)

            if (intNext >= intLen) // Check if the index of the intNext (next row) will exceed the end of array 
            { 
                arrayNewRecord.push(arrFirstRow); // Push the first row (last row) to the new array (arrResult)
                break; // Exit the while loop            
            }
            arrNextRow = array[intNext]; // Get the next record

        }
    }

    return arrayNewRecord; // return precessed log records after aggregating records
}

/* Function: parseData() - Split csv data into multiple rows and fields based on csv file format. 
    input
        - data: Raw data loaded from csv file
    return: 
        - arrayLogRecord: 2d array
*/
function parseData(data)
{
    let arrayLogRecord = [];
    let lbreak = data.split(rowDelimiter); // Split data into multiple rows
    lbreak.forEach(res => { // Split each row to multiple fields
        arrayLogRecord.push(res.split(feildsDelimiter));
    });
    // console.table(arrayLogRecord); // Output the table. // Only for testing and will be removed in final version
    return arrayLogRecord; // 2d array
}


/* Function: generatePlantUMLfile() - Generate PlantUML file based on the input log records
    input
        - arrayData: log records stored in a 2d array aftering running LNR
        - strPlantUMLTitle: Title of the generated UML chart
        - mode:0 for the orginal, 1 for the processed
    return: 
        - plantUMLScript: Generated PlantUML script
*/
generatePlantUMLScript = function generatePlantUMLScript(arrayData, strPlantUMLTitle, strFileNameWithoutPath, mode)
{
    let plantUMLScript = ""; // Define a empty PlantUML script
    let sender, receiver, timestamp;
    const header = "@startuml"; // PlantUML start elements: 
    const ender = "@enduml"; // PlantUML start elements
    const sendArrow = "->"; // PlantUML sender arrow elements
    const responsArrow = "<--"; // PlantUML receiver arrow elements
    // let title = "title ";
    let title = "title TraceID: (" + requestID +"), " + "DataFile: (" +strFileNameWithoutPath+ ")";

    // console.log(title);
    // newTitle = title.replaceAll("-", "_"); // Get the sender
    // console.log(newTitle);

    plantUMLScript += header + rowDelimiter; // Construct the beginning line of the PlantUML script: "@startuml\n"
    
    plantUMLScript += title + rowDelimiter; // Construct the title line of the PlantUML script
    

    // plantUMLScript += strPlantUMLTitle + rowDelimiter; // Construct the title line of the PlantUML script
    
    // Go through all the system components and define the PlantUML participant sequence
    // for(i=0; i<componentName.length;i++)
    // {
    //     // For example: "participant MSO-AAI as MSO_AAI oder 0\n"
    //     plantUMLScript += "participant " + componentName[i] +  " order " + i + rowDelimiter;
    // }
    if (arrayData.length <= 1)
    {
        for(i=0; i<componentName.length;i++)
        {
        // For example: "participant MSO-AAI as MSO_AAI oder 0\n"
        plantUMLScript += "participant " + componentName[i] +  " order " + i + rowDelimiter;
        }
    }
    else
    {
         // Go through all the log records
    // For each log record, get sender, receiver and timestamp then construct the PlantUML script for this record.
        for(i = 1, j = arrayData.length; i<j; i++)
        {
            item = arrayData[i]; // Get one record
            if (typeof item[colSenderIndex] !== "undefined" && typeof item[colReceiverIndex] !== "undefined")
            {
                sender = item[colSenderIndex].trim().toUpperCase().replace("-", ""); // Get the sender
                receiver = item[colReceiverIndex].trim().toUpperCase().replace("-", ""); // Get the receiver
                sender = sender.replace("&", ""); // Get the sender
                receiver = receiver.replace("&", ""); // Get the receiver
                sender = sender.replace("*", ""); // Get the sender
                receiver = receiver.replace("*", ""); // Get the receiver

                if (mode == 0)
                {
                    // original PlantUML script
                    label = item[colservicenameIndex];

                    // insert line breaks to the laber if > labelBreakLimit
                    labelBreakLimit =20;
                    const breakString = (str, limit) => {
                        let brokenString ="";
                        for (let i=0, count =0; i<str.length; i++)
                        {
                            if (count >= limit){
                                count = 0;
                                brokenString += rowDelimiter;
                                // console.log("** line breaks inserted!")
                            }else{
                                count++;
                                brokenString += str[i]
                            }
                        }
                        return brokenString;
                    }

                    // label = breakString(label, labelBreakLimit);
                    // console.log("******** label with line breaks: " + label)
                
                }
                else if (mode == 1)
                {
                    // processed PlantUML script
                        // Add the label based on the wiki page
                    if (sender == "MSO" && receiver == "AAI")
                    {
                        label = "Inventory";
                    }
                    else if (sender == "MSO" && receiver == "NARAD")
                    {
                        label = "Inventory";
                    }
                    else if (sender == "MSO" && receiver.includes("PINC"))
                    {
                        label = "Config Network Fabric";
                    }
                    else if (sender == "MSO" && receiver.includes("SDNC"))
                    {
                        label = "VF-Module Assignment";
                    }
                    else if (sender == "MSO" && receiver == "OPENSTACK")
                    {
                        label = "Instantiate Service";
                    }
                    else if (sender == "LYNKIT" && receiver == "MSO")
                    {
                        label = "Service Request";
                    }
                    else if (sender == "VID" && receiver == "MSO")
                    {
                        label = "Service Request";
                    }
                    else if (sender == "CCD" && receiver == "MSO")
                    {
                        label = "Service Request";
                    }
                    else if (sender == "STABILITY_TEST" && receiver == "MSO")
                    {
                        label = "Service Request";
                    }
                    else if (receiver == "AAI")
                    {
                        label = "Inventory";
                    }
                    else if (receiver == "NARAD")
                    {
                        label = "Inventory";
                    }
                    else
                    {
                        label = "";
                    }

                }
                plantUMLScript += sender + sendArrow + receiver + " : " + i + " " + label + rowDelimiter; // Construct the PlantUML statementplantUMLScript += sender + sendArrow + receiver + " : " + i + " " + label + rowDelimiter; // Construct the PlantUML statement

            }
        // Go through all the log records
        // For each log record, get sender, receiver and timestamp then construct the PlantUML script for this record.
        }
    }
    plantUMLScript += ender; // Construct the end line of PlantUML script: "@enduml"

    return plantUMLScript; // return the PlantUML script
}

/* Function: renderUMLSequenceChart() - Generate and save UML sequence chart
    input:
        - strPlantUMLFileName: PlantUML file name
        - strUMLSequenceChartFileName: UML sequence chart file name
        - mode: 0: for the original log records, 1: for the processed log records
    return: 
        - return_data: sytem status
*/
function renderUMLSequenceChartStdin(PlantUMLScript, strPlantUMLFileName, strUMLSequenceChartFileName, mode)
{

    // Render UML sequence chart for a PlantUML file based a lib of node-plantUML

    // child.exec("echo" + PlantUMLScript + "| java -jar ./bin/awk/plantuml.jar -tsvg -pipe >  ./public/generated_files/UML_sequence_charts/tmp.svg'");
    var exec = require('child_process').exec, child;
    // PlantUMLScript.trim();
    // var commd = "echo " + PlantUMLScript + ' | java -jar ./bin/awk/plantuml.jar -tsvg -pipe >  ./public/generated_files/UML_sequence_charts/tmp.svg';
    var commd = "echo '" + PlantUMLScript + "' | java -jar ./bin/awk/plantuml.jar -tsvg -pipe > " + strUMLSequenceChartFileName;
    

    var beginTime = +  new Date();
    child = exec(commd,
        
        function (error, stdout, stderr){
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (stderr.length != 0) {
            console.log('exec error: ' + error);
            // res.status(400).send("Error: No diagram found!");
          } 
          else {
            // bmp = path.join(__dirname, '../public/generated_files/UML_sequence_charts/tmp.svg');
            var endTime = +  new Date();
            console.log("Generate " + strUMLSequenceChartFileName + "UML chart:" + (endTime-beginTime) + "ms")
            return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
          }
        });

    // let gen = plantuml.generate(strPlantUMLFileName, {format: 'svg'});
    // var stream = gen.out.pipe(fs.createWriteStream(strUMLSequenceChartFileName));

    // // asy process: when the render is completed, seht the ststus code
    // stream.on('finish', function () { 
    //     if (mode == 0)
    //     {
    //         // Set original UML sequence chart is rendered
    //         return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
    //         return_data.RendnderAllUMLSequenceChartCompleted[0] = true;
    //     }
    //     else if (mode == 1)
    //     {
    //         // Set processed UML sequence chart is rendered
    //         return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
    //         return_data.RendnderAllUMLSequenceChartCompleted [1]= true;
    //     }
    //     else if (mode == 2)
    //     {
    //         // Set processed UML sequence chart is rendered
    //         return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
    //     }

    //     return return_data;
    // });

    // // Set the status to rendering the UML sequence chart
    // return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted

    return return_data;
}


/* Function: renderUMLSequenceChart() - Generate and save UML sequence chart
    input:
        - strPlantUMLFileName: PlantUML file name
        - strUMLSequenceChartFileName: UML sequence chart file name
        - mode: 0: for the original log records, 1: for the processed log records
    return: 
        - return_data: sytem status
*/
function renderUMLSequenceChart(strPlantUMLFileName, strUMLSequenceChartFileName, mode)
{

    // Render UML sequence chart for a PlantUML file based a lib of node-plantUML

    let gen = plantuml.generate(strPlantUMLFileName, {format: 'svg'});
    var stream = gen.out.pipe(fs.createWriteStream(strUMLSequenceChartFileName));

    // asy process: when the render is completed, seht the ststus code
    stream.on('finish', function () { 
        if (mode == 0)
        {
            // Set original UML sequence chart is rendered
            return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
            return_data.RendnderAllUMLSequenceChartCompleted[0] = true;
        }
        else if (mode == 1)
        {
            // Set processed UML sequence chart is rendered
            return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
            return_data.RendnderAllUMLSequenceChartCompleted [1]= true;
        }
        else if (mode == 2)
        {
            // Set processed UML sequence chart is rendered
            return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted;
        }

        return return_data;
    });

    // Set the status to rendering the UML sequence chart
    return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted

    return return_data;
}

// export the const, var and function for other js file to use
exports.ecomploggingMain = ecomploggingMain;
exports.readPlantUMLFile = readPlantUMLFile;
exports.readCSVFile = readCSVFile;
exports.return_data = return_data;
exports.statusCode = statusCode;
exports.fileLoadMode=fileLoadMode;
exports.generatePlantUMLScript = generatePlantUMLScript;