/*jslint plusplus:true*/

/* jshint strict: true, -W097, unused:false, undef:true */
/*global window, document, d3, $, io, navigator, setTimeout */

var chart_data = [];
/*Creation of the d3 ScatterPlot*/
var splot_dataset = [];
var chart_counter = 0;
//shifting of line graph
var xshift = -1;

//Creation of the d3 Chart
var chart_data = [];

//Creation of d3 LineGraph with an initial value
var chart_data_line = [10];

//Creation of the d3 ScatterPlot
var isPurged = 0;

var chart_purge_time = 0;

//Create a JSON style object for the margin
var margin = {
    top: 10,
    right: 20,
    bottom: 20,
    left: 20
};

var height = 0.5 * window.innerHeight;


/*
Function: validateIP()
Description: Attempt to connect to server/Intel IoT platform
*/
function validateIP() {
    'use strict';
    var socket,
    //Get values from text fields
        ip_addr = $("#ip_address").val(),
        port = $("#port").val(),
        script = document.createElement("script");

    //create script tag for socket.io.js file located on your IoT platform (development board)
    script.setAttribute("src", "http://" + ip_addr + ":" + port + "/socket.io/socket.io.js");
    document.head.appendChild(script);
    
    //Wait 1 second before attempting to connect
    setTimeout(function(){
        try {
            //Connect to Server
            socket = io.connect("http://" + ip_addr + ":" + port);

            //Attach a 'connected' event handler to the socket
            socket.on("connected", function (message) {
                //Apache Cordova Notification
                navigator.notification.alert(
                    "Great Job!",  // message
                    "",                     // callback
                    'You are Connected!',            // title
                    'Ok'                  // buttonName
                );

                //Set all Back button to not show
                $.ui.showBackButton = false;
                //Load page with transition
                $.ui.loadContent("#main", false, false, "fade");
            });
            socket.on("message", function (message) {
               message = (0+((message-312)*((255)/(400)))).toFixed(0);
                 $("#temp").css("color", "white");
              $("#temp").css("background-color", "rgb(255, 0,0)");
                $("#feedback_log").text(message);
            });
            socket.on("distance", function (message) {
                if (message==1)
                    message='Nobody is there';
                else
                    message='Somebody is there.';
                $("#feedback_log1").text(message);
            });
            socket.on("ldrValue", function (message) {
 $("#ldr").css("color", "white");
                $("#ldr").css("background-color", "rgb(255, 0,0)");
                $("#feedback_log2").text(message);
            });
            socket.on("sound", function (message) {

                $("#feedback_log3").text(message);
            });
            socket.on("soundCount", function (message) {
                if (message > 10 )
                $("#soundDefects").text("It's high time to look at the machine.");
                else
                    $("#soundDefects").text(" ");
            });
        } catch (e) {
            navigator.notification.alert(
                "Server Not Available!",  // message
                "",                     // callback
                'Connection Error!',            // title
                'Ok'                  // buttonName
            );
        }
    }, 1000);

}

