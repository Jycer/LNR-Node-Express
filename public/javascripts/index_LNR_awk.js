// Jeffrey's code - index.js: controller of index.html file, control the value of elements in index.html
// Verion 1.0
// Create Date: 07/04/2021 - created the file 
// Update Date: 07/06/2021 - added the dispplay UML sequence chart function 
// Update Date: 07/07/2021 - added the post CSV file funtion
// Update Date: 07/08/2021 - added the post PlantUML file funtion
// Update Date: 07/20/2021 - added radio button funtion
// Update Date: 07/21/2021 - modified refreshUMLSequenceChart
// Update Date: 07/22/2021 - added DownLoadFilesclick function

// Define obj of the status code showing system status
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

// Define the obj of the file load mode
var fileLoadMode = {
  "loadCSVFile": 0,
  "loadPlantUMLFile": 1,
}

const urlName = "awk";

// Define the obj of file load status
var fileLoadStatus;

// Define the file name (with path and without path) selected by the user
var strSelectedFileName, strSelectedFileNameWithoutPath;

// Define the timer event ID for showing the time used for gegerating the UML sequence chart
var intervalIDTimerCounter;

// Define the timer event ID for refreshing the img
var intervalIDRefreshIMG;

// Define the download status showing whether the down load button is clicked or not
var downloadStatus = false;

// Define the return data store the info responsed from the server
var return_data;

var is_sample = false;

function success_callback_call_loadCSVfile(returnData, filename) {
  // The CSV file is uploaded to the server successfully

  // Get the response from the server
  return_data = returnData;
  strSelectedFileNameWithoutPath = filename
  // Clear the file selector
  document.getElementById('loadCSVfile').value = ''

  // For testing
  // console.log(return_data);

  // Check the response from the server
  if (return_data.statusCode == statusCode.EmptyFile) {
    // The user upload an Empty CSV file

    // Display "Empty CSV file!" on the webpage
    document.getElementById("head_p1").innerHTML = "Empty CSV file!";

    // Stop time counter
    clearInterval(intervalIDTimerCounter);

    // Enable two file selector buttons
    document.getElementById("loadCSVfileBtn").disabled = false;
    document.getElementById("loadPlantUMLfileBtn").disabled = false;
    // Enable download file button
    document.getElementById("DownloadFilesBtn").disabled = true;

    // Enable two radio buttons
    document.getElementById("flexRadioOriginal").disabled = false;
    document.getElementById("flexRadioLNR").disabled = false;

    // Enable the demo file select button
    document.getElementById("demoDropdownMenu").disabled = false;

  }
  else if (return_data.statusCode == statusCode.RendnderAllUMLSequenceChartFailed) {
    // The server failed to render the UML sequence chart

    // Display "Failed to generate the UML Sequence Chart" on the webpage
    document.getElementById("head_p1").innerHTML = "Failed to generate the UML Sequence Chart";

    // Stop time counter
    clearInterval(intervalIDTimerCounter);

    // Enable two file selector buttons
    document.getElementById("loadCSVfileBtn").disabled = false;
    document.getElementById("loadPlantUMLfileBtn").disabled = false;
    // Disable download file button
    document.getElementById("DownloadFilesBtn").disabled = true;

    // Enable two radio buttons
    document.getElementById("flexRadioOriginal").disabled = false;
    document.getElementById("flexRadioLNR").disabled = false;

    // Enable the demo file select button
    document.getElementById("demoDropdownMenu").disabled = false;
  }
  else if (return_data.statusCode == statusCode.RendnderAllUMLSequenceChartCompleted) {

    // The server to render the UML sequence chart successfully
    // Display UML sequence chart
    document.getElementById("head_p1").innerHTML = "";
    // document.getElementById("head_p1").innerHTML="UML Sequence Chart for a New Audit Log File";
    // alert(intervalIDTimerCounter)
    // Stop time counter
    clearInterval(intervalIDTimerCounter);

    // set refresh UML sequece chart time counter
    intervalIDRefreshIMG = setInterval(() => refreshUMLSequenceChart(strSelectedFileNameWithoutPath), 1000);
  }
}

/* Function: upload CSV/PlantUML file to the Node server
 This is a callback function, when the use select the CSV/PlantUML file, this function will be called
 input
    - event: file obj
 return:
    - None
 */
function upload(event) {
  // Get file name selected
  strSelectedFileName = event.value;
  // Get file name without path
  strSelectedFileNameWithoutPath = strSelectedFileName.substring(strSelectedFileName.lastIndexOf('\\') + 1);
  // Define the time counter
  var time_cnt = 0;

  // Set the downloadStatus is false
  downloadStatus = false;

  // Enable the two radio button
  document.getElementById("flexRadioOriginal").disabled = true;
  document.getElementById("flexRadioLNR").disabled = true;

  // Enable the two file select button
  document.getElementById("loadCSVfileawkBtn").disabled = true;
  document.getElementById("loadPlantUMLfileBtn").disabled = true;

  // Enable the demo file select button
  document.getElementById("demoDropdownMenu").disabled = true;


  // Enable the download files button
  document.getElementById("DownloadFilesBtn").disabled = true;


  // Check which button is clicked
  if (event.id == "loadCSVfileawk") {
    // The user choosed "loadCSVfile"

    // Hide the img 
    document.getElementById("imgUMLSquenceChart").style.display = "none";

    // Display "Rendering the UML Sequence Chart for a New Audit Log File" on the page
    document.getElementById("head_p1").innerHTML = "Rendering the UML Sequence Chart";
    // document.getElementById("head_p1").innerHTML="Rendering the UML Sequence Chart for a New Audit Log File";

    // Set fileLoadStatus to the loadCSVFile
    fileLoadStatus = fileLoadMode.loadCSVFile;

    // Start the time counter: showing time counter
    intervalIDTimerCounter = setInterval(() => {
      document.getElementById("head_p1").innerHTML = "Rendering the UML Sequence Chart (" + time_cnt + " s)";
      // document.getElementById("head_p1").innerHTML="Rendering the UML Sequence Chart for a New Audit Log File (" + time_cnt + " s)";
      time_cnt++;
    }, 1000);


    // Post the selected CSV file to the server
    // console.log($("#uploadCSVForm")[0]);
    $.ajax({
      type: 'POST', // HTTP POST command
      url: urlName +'/loadCSVFileawk', // Post the url to the server
      processData: false,
      contentType: false,
      data: new FormData($("#uploadCSVForm")[0]), // Post a CSV file to the servel
      success: function (returnData) {
        success_callback_call_loadCSVfile(returnData, strSelectedFileNameWithoutPath)
        clearInterval(intervalIDTimerCounter)
      },
      error: function (returnData) {
        // The server has the issues to receive the CSV file the user uploaded

        // Display msg on the page
        document.getElementById("head_p1").innerHTML = "Server error！Please try again.";

        // Enable two file selector buttons
        document.getElementById("loadCSVfileawkBtn").disabled = false;
        document.getElementById("loadPlantUMLfileBtn").disabled = false;
        // Disable download file button
        document.getElementById("DownloadFilesBtn").disabled = true;

        // Enable two radio buttons
        document.getElementById("flexRadioOriginal").disabled = false;
        document.getElementById("flexRadioLNR").disabled = false;

        // Enable the demo file select button
        document.getElementById("demoDropdownMenu").disabled = false;

        // Stop time counter
        clearInterval(intervalIDTimerCounter);
      }
    })
  }
  else {
    // The user select an existing PlantUML file

    // Hide the img 
    document.getElementById("imgUMLSquenceChart").style.display = "none";

    // Display the msg "Rendering the UML Sequence Chart for an Existing PlantUML File" on the webpage
    // document.getElementById("head_p1").innerHTML="Rendering the UML Sequence Chart for an Existing PlantUML File";
    document.getElementById("head_p1").innerHTML = "Rendering the UML Sequence Chart";

    // Set the "Original" radio button is checked
    document.getElementById("flexRadioOriginal").checked = "checked";

    // Set the fileLoadStatus to loadPlantUMLFile
    fileLoadStatus = fileLoadMode.loadPlantUMLFile;

    // Set the time counter
    var intervalIDTimerCounter = setInterval(() => {
      // document.getElementById("head_p1").innerHTML="Rendering the UML Sequence Chart for an Existing PlantUML File (" + time_cnt + " s)";
      document.getElementById("head_p1").innerHTML = "Rendering the UML Sequence Chart (" + time_cnt + " s)";
      time_cnt++;
    }, 1000);

    // The user select a existing PlantUML file to the server
    // console.log($("#uploadPUMLForm")[0]);
    $.ajax({
      type: 'POST', // HTTP POST command
      url: urlName +'/', // post url to the seruver
      processData: false,
      contentType: false,
      data: new FormData($("#uploadCSVForm")[0]), // post selected PlantUML file
      success: function (returnData) {
        // The CSV file is uploaded to the server successfully

        // Get the response from the server
        return_data = returnData;

        // Clear the file selector
        document.getElementById('loadPlantUMLfile').value = ''

        // Check the response from the server
        if (return_data.statusCode == statusCode.EmptyFile) {
          // The user upload an Empty CSV file

          // Display "Empty CSV file!" on the webpage
          document.getElementById("head_p1").innerHTML = "Empty PUMP file!";

          // Stop time counter
          clearInterval(intervalIDTimerCounter);

          // Enable two file selector buttons
          document.getElementById("loadCSVfileawkBtn").disabled = false;
          document.getElementById("loadPlantUMLfileBtn").disabled = false;
          // Disable download file button
          document.getElementById("DownloadFilesBtn").disabled = true;

          // Enable two radio buttons
          document.getElementById("flexRadioOriginal").disabled = false;
          document.getElementById("flexRadioLNR").disabled = false;

          // Enable the demo file select button
          document.getElementById("demoDropdownMenu").disabled = false;
        }
        else if (return_data.statusCode == statusCode.RendnderAllUMLSequenceChartFailed) {
          // Display msg on the page
          document.getElementById("head_p1").innerHTML = "Failed to generate the UML Sequence Chart";

          // Stop time counter
          clearInterval(intervalIDTimerCounter);

          // Enable two file selector buttons
          document.getElementById("loadCSVfileawkBtn").disabled = false;
          document.getElementById("loadPlantUMLfileBtn").disabled = false;
          // Disable download file button
          document.getElementById("DownloadFilesBtn").disabled = true;

          // Enable two radio buttons
          document.getElementById("flexRadioOriginal").disabled = false;
          document.getElementById("flexRadioLNR").disabled = false;

          // Enable the demo file select button
        document.getElementById("demoDropdownMenu").disabled = false;

        }
        else if (return_data.statusCode == statusCode.RendnderAllUMLSequenceChartCompleted) {

          // Display msg on the page
          document.getElementById("head_p1").innerHTML = "";
          // document.getElementById("head_p1").innerHTML="UML Sequence Chart for an Existing PlantUML File";

          // Stop time counter
          clearInterval(intervalIDTimerCounter);

          // set refresh time counter
          intervalIDRefreshIMG = setInterval(() => refreshUMLSequenceChart(strSelectedFileNameWithoutPath), 1000);
        }

      },
      error: function (returnData) {
        // The server has the issues to recieve the CSV file the user uploaded

        // Display msg on the page
        document.getElementById("head_p1").innerHTML = "Server error！Please try again.";

        // Enable two file selector buttons
        document.getElementById("loadCSVfileawkBtn").disabled = false;
        document.getElementById("loadPlantUMLfileBtn").disabled = false;
        // Disable download file button
        document.getElementById("DownloadFilesBtn").disabled = true;

        // Enable two radio buttons
        document.getElementById("flexRadioOriginal").disabled = false;
        document.getElementById("flexRadioLNR").disabled = false;

        // Enable the demo file select button
        document.getElementById("demoDropdownMenu").disabled = false;

        // Stop time counter
        clearInterval(intervalIDTimerCounter);
      }
    })

  }
}


/* Callback Function: When the UML sequence chart is loaded and displayed on the webpage, this function is called
 input
    - None
 return:
    - None
 */
function imgUMLSquenceChartOnload() {
  // Stop the time counter
  clearInterval(intervalIDRefreshIMG);

  // Enable two file selector buttons
  document.getElementById("loadCSVfileBtn").disabled = false;
  document.getElementById("loadPlantUMLfileBtn").disabled = false;

  // Enable the demo file select button
  document.getElementById("demoDropdownMenu").disabled = false;
  // Disable download file button
  document.getElementById("DownloadFilesBtn").disabled = false;

  if (fileLoadStatus == fileLoadMode.loadCSVFile) {
    // User selected a CSV file
    // Enable two radio buttons
    document.getElementById("flexRadioOriginal").disabled = false;
    document.getElementById("flexRadioLNR").disabled = false;

    // Download files automaticaly to the client
    // if (!downloadStatus) {   // Download generated files
    //   let popoutOriginal = window.open(urlName + '/downloadOriginalPlantUMLFile/' + strSelectedFileNameWithoutPath);
    //   window.setTimeout(function () {
    //     popoutOriginal.close();
    //   }, 1000);

    //   let popoutProcessed = window.open(urlName + '/downloadProcessedPlantUMLFile/' + strSelectedFileNameWithoutPath);
    //   window.setTimeout(function () {
    //     popoutProcessed.close();
    //   }, 1000);

    //   downloadStatus = true;
    // }
  }
  else {
    // User selected a PlantUML file
    // Download files automaticaly to the client
    // if (!downloadStatus)
    // {
    //   // Dnow laod generated files
    //   window.open('/downloadExistingUMLSequenceChart/' + strSelectedFileNameWithoutPath);
    //   downloadStatus = true;
    // }
  }
}


/* Function: refresh a UML sequence chart
 input:
    -strSelectedFileName: UML sequence chart file name
 return: None
 */
function refreshUMLSequenceChart(strSelectedFileName) {
  // Get the selected file name without extension
  strSelectedFileNameWithouExt = strSelectedFileName.substring(0, strSelectedFileName.lastIndexOf('.'));

  // Check whether the Load CSV file or Browse PlantUML files button is clicked
  if (fileLoadStatus == fileLoadMode.loadCSVFile) {
    //The Load CSV file is uploaded

    // Check which radio button is checked
    if (document.getElementById("flexRadioOriginal").checked == true) {
      // "original" radio button is checked
      // Display original UML sequence chart
      $("#imgUMLSquenceChart").attr("src", "/static/generated files/UML sequence charts/" + strSelectedFileNameWithouExt + "_originalUMLSequenceChart.svg?" + Math.random());
      $("#imgUMLSquenceChart").show();
    }
    else {
      // "Apply LNR algorithm" radio button is checked
      // Display processed UML sequence chart
      $("#imgUMLSquenceChart").attr("src", "/static/generated files/UML sequence charts/" + strSelectedFileNameWithouExt + "_processedUMLSequenceChart.svg?" + Math.random());
      $("#imgUMLSquenceChart").show();
    }
  }
  else {
    // Display UML sequence chart for an existing PlantUML script
    $("#imgUMLSquenceChart").attr("src", "/static/generated files/UML sequence charts/" + strSelectedFileNameWithouExt + "_UMLSequenceChart.svg?" + Math.random());
    $("#imgUMLSquenceChart").show();
  }

}

/* Callback Function: When the radio btn is checked, this function is called
 input
    - radio btn obj, not used
 return:
    - None
 */
function RadioBtnChecked(myRadio) {
  if (is_sample) {
    refreshSampleSequenceChart(filename)
    return
  }
  // Check if the UML sequence chart is rendered
  if (return_data.statusCode == statusCode.RendnderAllUMLSequenceChartCompleted) {
    // The UML sequence chart is rendered

    // Call refreshUMLSequenceChart() function to display the UML sequence chart
    refreshUMLSequenceChart(strSelectedFileNameWithoutPath);
  }

}


/* Function: Download files from the server to the client when the user click down load files button
 input
    - none
 return:
    - None
 */
// function DownLoadFilesclick() {
//   if (fileLoadStatus == fileLoadMode.loadCSVFile) {
//     // User selected a CSV file
//     // if (!downloadStatus) {   // Download generated files
//             let popoutOriginal = window.open(urlName + '/downloadOriginalPlantUMLFile/' + strSelectedFileNameWithoutPath);
//       window.setTimeout(function () {
//         popoutOriginal.close();
//       }, 1000);

//       let popoutProcessed = window.open(urlName + '/downloadProcessedPlantUMLFile/' + strSelectedFileNameWithoutPath);
//       window.setTimeout(function () {
//         popoutProcessed.close();
//       }, 1000);
//       // window.open(urlName + '/downloadOriginalPlantUMLFile/' + strSelectedFileNameWithoutPath);
//       // window.open(urlName + '/downloadProcessedPlantUMLFile/' + strSelectedFileNameWithoutPath);
//       // window.open('/downloadOriginalUMLSequenceChart/' + strSelectedFileNameWithoutPath);
//       // window.open('/downloadProcessedUMLSequenceChart/' + strSelectedFileNameWithoutPath);
//       downloadStatus = true;
//     // }
//   }
//   else {
//     // User selected a PlantUML file
//     // if (!downloadStatus) {
//     //   // Download generated files
//     //   window.open('/downloadExistingUMLSequenceChart/' + strSelectedFileNameWithoutPath);
//     //   downloadStatus = true;
//     // }
//   }
// }
function DownLoadFilesclick() {
  if (fileLoadStatus == fileLoadMode.loadCSVFile) {
    // User selected a CSV file
    // if (!downloadStatus) {   // Download generated_files
    if (document.getElementById("flexRadioOriginal").checked == true) {
      let popoutOriginal = window.open(urlName + '/downloadOriginalPlantUMLFile/' + strSelectedFileNameWithoutPath);
      window.setTimeout(function () {
        popoutOriginal.close();
      }, 1000);
    }
    else{
      let popoutProcessed = window.open(urlName + '/downloadProcessedPlantUMLFile/' + strSelectedFileNameWithoutPath);
      window.setTimeout(function () {
        popoutProcessed.close();
      }, 1000);
    }
      // window.open(urlName + '/downloadOriginalPlantUMLFile/' + strSelectedFileNameWithoutPath);
      // window.open(urlName + '/downloadProcessedPlantUMLFile/' + strSelectedFileNameWithoutPath);
      // window.open('/downloadOriginalUMLSequenceChart/' + strSelectedFileNameWithoutPath);
      // window.open('/downloadProcessedUMLSequenceChart/' + strSelectedFileNameWithoutPath);
      downloadStatus = true;
    // }
  }
  else {
    // User selected a PlantUML file
    // if (!downloadStatus) {
    //   // Download generated_files
    //   window.open('/downloadExistingUMLSequenceChart/' + strSelectedFileNameWithoutPath);
    //   downloadStatus = true;
    // }
  }
}


$(document).ready(function () {
  load_samples_from_server()
})
function load_samples_from_server() {
  $.get(urlName + "/samplefiles", (data, status) => {
    data.forEach(function (item, index, array) {
      console.log(item, index)
      // var item = "<li>" + item + "</li>";
      var html = "<li role='presentation'> <a role='menuitem' tabindex='-1'>" + item + "</a> </li>";
      $("#filelist").append(html)
    })

    $("li").click(function () {
        // Enable the two radio button
      document.getElementById("flexRadioOriginal").disabled = true;
      document.getElementById("flexRadioLNR").disabled = true;

      // Enable the two file select button
      document.getElementById("loadCSVfileBtn").disabled = true;
      document.getElementById("loadPlantUMLfileBtn").disabled = true;

      // Disable download file button
      document.getElementById("DownloadFilesBtn").disabled = true;

      // Enable the demo file select button
      document.getElementById("demoDropdownMenu").disabled = true;

      time_cnt = 0;
      // Hide the img 
      document.getElementById("imgUMLSquenceChart").style.display = "none";

      // Display "Rendering the UML Sequence Chart for a New Audit Log File" on the page
      document.getElementById("head_p1").innerHTML = "Rendering the UML Sequence Chart";
      // document.getElementById("head_p1").innerHTML="Rendering the UML Sequence Chart for a New Audit Log File";

      // Set fileLoadStatus to the loadCSVFile
      fileLoadStatus = fileLoadMode.loadCSVFile;
      downloadStatus = false;


      // Start the time counter: showing time counter
      intervalIDTimerCounter = setInterval(() => {
        document.getElementById("head_p1").innerHTML = "Rendering the UML Sequence Chart (" + time_cnt + " s)";
        // document.getElementById("head_p1").innerHTML="Rendering the UML Sequence Chart for a New Audit Log File (" + time_cnt + " s)";
        time_cnt++;
      }, 1000);

      filename = $(this).text();
      filename = filename.trim()
      console.log("name" + filename)
      // refreshSampleSequenceChart(filename)
      //  is_sample=true;
      // send request to server to run LNR
      //success_callback_call_loadCSVfile(returnData)
      // var strSelectedFileName = filename;
      fileLoadStatus = fileLoadMode.loadCSVFile
      $.get(urlName + "/loadServerCSV/" + filename, (returnData) => {
        console.log("call");
        console.log(returnData)
        success_callback_call_loadCSVfile(returnData, filename)
        clearInterval(intervalIDTimerCounter)
      });
    });
  });
}

/* Function: refresh the sample UML sequence chart
 input:
    -strSelectedFileName: CSV file name
 return: None
 */
function refreshSampleSequenceChart(strSelectedFileName) {
  // Get the selected file name without extension
  strSelectedFileNameWithouExt = strSelectedFileName.substring(0, strSelectedFileName.lastIndexOf('.'));
  return_data = {}
  return_data.statusCode = statusCode.RendnderAllUMLSequenceChartCompleted
  // Check which radio button is checked
  if (document.getElementById("flexRadioOriginal").checked == true) {
    // "original" radio button is checked
    $("#imgUMLSquenceChart").attr("src", "/static/sample_data/generated files/UML sequence charts/" + strSelectedFileNameWithouExt + "_originalUMLSequenceChart.svg?" + Math.random());
    $("#imgUMLSquenceChart").show();
  }
  else {
    // "Apply LNR algorithm" radio button is checked
    // Display processed UML sequence chart
    $("#imgUMLSquenceChart").attr("src", "/static/sample_data/generated files/UML sequence charts/" + strSelectedFileNameWithouExt + "_processedUMLSequenceChart.svg?" + Math.random());
    $("#imgUMLSquenceChart").show();
  }

}