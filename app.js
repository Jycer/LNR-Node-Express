 /* Jeffrey's code - Node server main file
    Verion 1.0
    Create Date: 07/03/2021 - created node server file
    Update Date: 07/18/2021 - commented the port number since we use bin/www script as the starting entry
    Update Date: 07/25/2021 - Imported awk rounte 

 */

   
// Import libs
var express = require('express')
var app = express()
var path = require('path')
var ecomplogging_routes = require('./routes/ecomplogging_routes')
var LNR_awk_routes = require('./routes/LNR_awk_routes')

// Set paths
// Set the root path for the index web page
app.use('/',ecomplogging_routes)

// Set the root path for the index web page
app.use('/awk',LNR_awk_routes)

// Set the path for the Public folder
app.use('/static',express.static(path.join(__dirname, 'public')))

// // Other routes here
// app.use('*', function(req, res){
//    res.sendFile(path.join(__dirname,'./views/error.html'))
// });

// For testing
// Set port number
// const port = process.env.port || 8082;

// // Start the Node server
// app.listen(port,() =>{
//     console.log(`Server running on port ${port}`);
// })

module.exports = app;