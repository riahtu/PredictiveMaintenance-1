/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
A simple node.js application intended to blink the onboard LED on the Intel based development boards such as the Intel(R) Galileo and Edison with Arduino breakout board.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/intel-xdk-iot-edition-nodejs-templates
*/

var mraa = require('mraa'); //require mraa

var dgram = require('dgram');
var client = dgram.createSocket('udp4');
var server = dgram.createSocket("udp4");

// UDP Options
var options = {
    host : '127.0.0.1',
    port : 41234
};

console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console

//var myOnboardLed = new mraa.Gpio(3, false, true); //LED hooked up to digital pin (or built in pin on Galileo Gen1)

var redLed = new mraa.Gpio(2); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
var greenLed = new mraa.Gpio(3);
var blueLed = new mraa.Gpio(4);
//var buzzer =  new mraa.Gpio(6);
var temp_sensor = new mraa.Aio(0);
var distance_sensor = new mraa.Gpio(5);
//var vibration_sensor = new mraa.Aio(1);
var ldr_sensor = new mraa.Aio(2);
var sound_sensor = new mraa.Aio(3);
var resetButton = new mraa.Gpio(7);

var soundCount = 0;

redLed.dir(mraa.DIR_OUT); //set the gpio direction to output
greenLed.dir(mraa.DIR_OUT);
blueLed.dir(mraa.DIR_OUT);
//buzzer.dir(mraa.DIR_OUT);
distance_sensor.dir(mraa.DIR_IN);
resetButton.dir(mraa.DIR_IN);

//periodicActivity(); //call the periodicActivity function

function periodicActivity(socket)
{

    'use strict';
    setInterval(function () {
    console.log(sound_sensor.read());
    if (distance_sensor.read()==0){
        redLed.write(1);
        greenLed.write(0);
    }
    else{
        redLed.write(0);
        greenLed.write(1);
    }
    if (ldr_sensor.read() > 200)
         blueLed.write(1);
    else
         blueLed.write(0);
        
    if (resetButton.read() == 1)
        soundCount = 0;
    console.log(resetButton.read());
    sendObservation('temp',temp_sensor.read(), new Date().getTime());
    sendObservation('sound',sound_sensor.read(), new Date().getTime());
        sendObservation('soundcount',soundCount, new Date().getTime());
    /*socket.emit("LDR", ldr_sensor.read());
    socket.emit("temp", temp_sensor.read());
    socket.emit("sound", sound_sensor.read());*/
    
        if (sound_sensor.read()> 500)
            soundCount++;
    socket.emit("message",temp_sensor.read());
    socket.emit("ldrValue",ldr_sensor.read());    
    socket.emit("sound",sound_sensor.read());    
    socket.emit("distance",distance_sensor.read());   
    socket.emit("soundCount",soundCount);   
  }, 400);
}

function sendObservation(name, value, on){
    var msg = JSON.stringify({
        n: name,
        v: value,
        on: on
    });

    var sentMsg = new Buffer(msg);
    console.log("Sending observation: " + sentMsg);
    client.send(sentMsg, 0, sentMsg.length, options.port, options.host);
};

/*

client.on("message", function(mesg, rinfo){
    console.log('UDP message from %s:%d', rinfo.address, rinfo.port);
    var a = JSON.parse(mesg);
    console.log(" m ", JSON.parse(mesg));

    if (a.b == 5) {
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to ' + HOST +':'+ PORT);
            // client.close();

        });
    }
});
*/


//Create Socket.io server
var http = require('http');
var app = http.createServer(function (req, res) {
    'use strict';
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('<h1>Hello world from Intel IoT platform!</h1>');
}).listen(1337);
var io = require('socket.io')(app);

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {
    'use strict';
    console.log('a user connected');
    //Emits an event along with a message
    socket.emit('connected', 'Welcome');


    //Start watching Sensors connected to Galileo board
   periodicActivity(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});