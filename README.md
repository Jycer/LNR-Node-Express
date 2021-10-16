# Description of the project folders and files

LNR-algorithm-GUI-code/
        app.js   (a NodeJS server file importing ecomplogging_routes.js file)
        bin/  (contains script for starting the server)
              www (an script for starting the server)
        routes/    (contains route files connecting controller functions to URL requests)
                ecomplogging_routes.js    (a route file connecting controller functions in ecomplogging.js to specific URL requests (i.e., /index, /loadCSVFile and /loadPlantUMLFile))
                ecomplogging.js    (contains the main implementation of the LNR algorithm, PlantUML file generation and UML sequence chart generation)
        views/     (contains HTML webpage files)
                index.html     (main page where the user can 1) upload a new audit log file to the server and generate a UML sequence chart; 2) browse an existing PlantUML file and generate a UML sequence chart)
        public/    (contains files that can be used by users)
                images/ (contains images)
                      AT&T_logo.svg    (AT&T logo file used by index.html)
                javascripts/  (this folder contains the Javascripts for the GUI and open source libraries)
                      index.js    (contains functions used for user interaction in the index.html file)
                      jquery.js    (an open source library used by the index.js and index.html)
                  

# First running

1. Put all the project folders and files into your local testing directory, for example: "c:\Users\jv4862\Documents\Ecomp Loggining\ecomplogging".

2. Type ```cd c:\Users\jv4862\Documents\Ecomp Loggining\LNR-algorithm-GUI-code``` in the terminal to go to your local testing directory

3. Type ```npm init``` in the terminal to intialize the Node server

4. Type ```npm install``` in the terminal to install the needed library

# You should check following things before Running the program
1. If you find that the program is still running in VS code terminal, you can press "contrl-c" to stop the server and then type ```npm start``` to start the server again. Open a web browser, in the url input ```localhost:3000/index```, your web page should open now.

2. If you find that you are in the right folder ```c:\Users\jv4862\Documents\Ecomp Loggining\LNR-algorithm-GUI-code``` and the server is not running. Just type ```npm start``` to start the server. Open a web browser, in the url input ```localhost:3000/index```, your web page should open now.

3. Otherwise, Please follow the step below to start the server.

# Running steps 
1. (You can skip this step, if you have already done) 
    Change the line 47 in the ecomplogging.js file: 
        if the server runs on the Linux OS: "const OSMode = OSModeCode.Linux"
        If the server runs on the Windows OS: "const OSMode = OSModeCode.Windows"
2. Type ```cd c:\Users\jv4862\Documents\Ecomp Loggining\LNR-algorithm-GUI-code``` in the terminal to go to your local testing folder 

3. Type ```npm start``` in the terminal to start the server

4. Open a web browser, in the url input ```localhost:3000/index```, Your webpage should open now

5. Type "ctrl-c" to stop the server when you will not want to use the server every time.
