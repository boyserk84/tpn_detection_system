/**
* Security & Detection system
* (Hackathon Project 10/25/2014)
* hack.js
* 
* This file is for deploying on Tessel hardware.
*
* To deploy and run ,
* 	you need to run the following from node.js command line:
*		tessel run hack.js
* Require: Internet connection if you need to send data over.
*	To connect Tessel hardware to Wifi, you need to run the following:
*		tessel wifi -n <YOUR_SSID> -p <YOUR_WIFI_PASSWORD>
*
*	@author nkemavaha (Nate K.)
*/


console.log("Tessel-PubNub Security and Detection system -- Hacking integration");


// Constant defines
// Tessel constants
var GPS_PORT = 'C';			// This corresponds to PORT you connect GPS module to.
var AMBIENT_PORT = 'A';		// This corresponds to PORT you connect AMBIENT module to.
var GPS_MODULE_NAME = 'gps-a2235h';
var AMBIENT_MODULE_NAME = 'ambient-attx4';
var WIFI_MODULE_NAME = 'wifi-cc3000';

// PubNub constants
var PUBNUB_CHANNEL = 'tessel-light';	// Name of the PubNub channel where Tessel and client communicate
var PUB_KEY = '';	// Publish key
var SUB_KEY = '';	// Subscription key

// Type of report 
// Communicating via PubNub Channel
var USER_REPORT = 'user-report';	// Client reporting or command
var TESSEL_REPORT = 'tessel-report';	// Tessel reporting or command

// This used for differentiate type of messages back and forth via PubNub channel.
var MESSAGE_ALERT_TYPE = 'alert';
var MESSAGE_WARNING_TYPE = 'warning';
var MESSAGE_NORMAL_TYPE = 'normal';

// Flag for enable/disable certain hardware modules if needed
var GPS_CONNECT = false;
var AMBIENT_CONNECT = true;

// PubNub Object --- Only instantiate when there is an internet connection
// Otherwise, you'll get a bunch of memory-leak on tcp-close for setMaxEventListeners()
var pubnub = null;

// Tessel Lib
var tessel = require("tessel");
// Modules Dependencies
var gpsLib = require( GPS_MODULE_NAME );
var ambientLib = require( AMBIENT_MODULE_NAME );
var wifi = require( WIFI_MODULE_NAME );

var gps = (GPS_CONNECT == true)?gpsLib.use(tessel.port[GPS_PORT]):null;
var ambient = (AMBIENT_CONNECT == true)?ambientLib.use(tessel.port[AMBIENT_PORT]):null;


// Trying to connect to the wifi network if predefined
if ( wifi != null && wifi.isEnabled() && wifi.connection() == null ) {
	// This is optional if already connect Tessel to Wifi
	
	console.log("Connecting to internet because Tessel hasn't been connected to.");
	wifi.connect( 
	{
		ssid: "<YOUR_SSID>",
		password: "<YOUR_SSID_PASSWORD>",
		timeout: 50
	},
	function(res) {
		console.log(res);
	});
}

// If already connected, then instantiate PubNub
if ( wifi != null && wifi.isEnabled() && wifi.connection() ) {
	// Initialize PubNub if there is internet connection.
	pubnub = require("pubnub-hackathon").init({ 
		publish_key: PUB_KEY,
		subscribe_key: SUB_KEY 
	});
} else {
	console.log("Wifi is disabled or there is no internet connection!");
}

/**
* Helper function to broadcast message to PubNub Channel
* (i.e. basically, we use this to send data from module/sensor back to clients via PubNub channel)
* @param message		JSON Object
*/
function publish(message) {
	if ( pubnub != null ) {
		pubnub.publish(
			{
				channel: PUBNUB_CHANNEL,
				message: message
			}
		);
	
	} else {
		console.log("PubNub has not been initialized!");
	}
}

console.log("Dependencies initialized done");

// Checking if gps ready
if ( gps != null && GPS_CONNECT == true) {
	// Basic idea here is to tracking location where the Tessel Hardware is moving
	// and send back location-data via PubNub channel and broadcast it to client.
	
	// However, you will need to be outside in order to get this to work.
	// See https://forums.tessel.io/t/gps-module-replacement/461/25 for more information
	// about GPS not working indoor or taking too long to get satellites signal

	// Init GPS
	gps.on('ready', function() {
		console.log('GPS Module powered and ready .... waiting for satellites');
		/**
		* Callback when coordinates received
		*/
		gps.on('coordinates', function (coords) {
			console.log('Lat:', coords.lat, '\tLon:', coords.lon, '\tTimestamp:', coords.timestamp);
		});
		
		/**
		* Callback when we have information about fix satellites.
		*/
		gps.on('fix', function(data) {
			console.log(data.numSat, 'fixed.');
		});
		
		/**
		* Callback when GPS signal dropped
		*/
		gps.on('drop', function() {
			console.log("Signal dropped! Good luck bro!");
		});
		
		gps.on('error', function(err){
			console.log("got this error", err);
		});
		
	});
} else {
	console.log("GPS module isn't available!");
}	

console.log("Loading ambient");
var lightTriggerVal = 0.03;
if ( ambient != null && AMBIENT_CONNECT == true ) {
	// Reference: http://start.tessel.io/modules/ambient

	// Init Ambient module
	ambient.on('ready', function() {
		console.log('Ambient Module powered and ready..... waiting for response');
		
		
		// Get points of light and sound data in normal mode
		setInterval( function () {
			ambient.getLightLevel( function(err, ldata) {
				if (err) {
					throw err;
				}
			
				ambient.getSoundLevel( function(err, sdata) {
					if (err) {
						throw err;
					}
					
					var lVal = ldata.toFixed(8);
					var sVal = sdata.toFixed(8);
					
					
					// Don't enable this !!! this will bring down Tessel and PUBNUB server.
					//publish({
					//	command: "tessel-report",
					//	data: {
					//		light: lVal,
					//		sound: sVal
					//	},
					//});
					
					console.log("Light level:", ldata.toFixed(8), " ", "Sound Level:", sdata.toFixed(8));
				});
			})
		}, 500); // The readings will happen every .5 seconds unless the trigger is hit
		
		
		// Set a light level trigger
		ambient.setLightTrigger( lightTriggerVal );
		
		// Set a light level trigger
		// The trigger is a float between 0 and 1
		ambient.on('light-trigger', function(data) {
			console.log("Our light trigger was hit:", data);

			// Broadcast via PubNub channel when light alert is triggered
			publish({
				command: TESSEL_REPORT,
				data: {
					light: data
				},
				type: MESSAGE_ALERT_TYPE			
			});
			
			// Clear the trigger so it stops firing
			ambient.clearLightTrigger();
			//After 1.5 seconds reset light trigger
			setTimeout(function () {

				ambient.setLightTrigger( lightTriggerVal );

			},1500);
		});

		// Set a sound level trigger
		// The trigger is a float between 0 and 1
		ambient.setSoundTrigger(0.1);

		ambient.on('sound-trigger', function(data) {
			console.log("Something happened with sound: ", data);
			
			// Clear it
			ambient.clearSoundTrigger();
			
			// Broadcast via PUBNUB that sound alert is triggered.
			publish({
				command: TESSEL_REPORT,
				data: {
					sound: data
				},
				type: MESSAGE_ALERT_TYPE
			});
			
			//After 1.5 seconds reset sound trigger
			setTimeout(function () {	
				ambient.setSoundTrigger(0.1);
			},1500);
		});
	});
} else {
	console.log("Ambient Module is NOT available.");
}

// Checking for pubnub
if ( pubnub != null ) {
	// Basic idea here is to listen for any command/message.
	// Tessel hardware will execute actions based on the type of message received.
	
	// Listen for PubNub data channel
	pubnub.subscribe(
		{ 
			channel: PUBNUB_CHANNEL, 
			message:
			/**
			* Callback when receiving a response from PubNub Channel
			* (i.e. receiving a command from client)
			* @param response	JSON object
			*  NOTE:
			*       Example of  response format:
			*		{
			*			"command": "user-report",
			*			"text": "Hello-World!",
			*			"data": {
			*				"sound": 0.01789,
			*				"light": 0.98443
			*			}
			*		}
			*	'data' field could be anything. Usually, whatever data received from the module.
			*	i.e. GPS would gives us long and lat value while Ambient module gives us sound and light values.
			*
			*/
			function(response) {
				//tessel.led[1].output().toggle();
				// Initialize Tessel LED variables
				var led1 = tessel.led[0].output(1);
				var led2 = tessel.led[1].output(0);
				
				// This is where all the fun begins!
				
				/** Trigger after warning is above the certain threshold */
				if ( response.command != null && response.command == 'kill') {
					setInterval(function() {
						// Toggle the led states, kill the target!!!
						// TODO: Trigger security protocol (i.e. self-destruct like Mission Impossible or trigger alarm)
						
						// In this case, blinking LED light
						led1.toggle();
						led2.toggle();
						
					}, 100);
				}
				
				
				// Notifying there is an incoming message from PUBNUB Channel by Client
				if ( response.command != null && response.command == USER_REPORT) {
					// Set the led pins as outputs with initial states
					// Truthy initial state sets the pin high
					// Falsy sets it low.

					// Trigger LED every time we receive a message from USER.
					setTimeout(function () {
						// Toggle the led states
						led1.toggle();
						led2.toggle();
					}, 100);
				
					console.log(response);
					
					if ( response.command != null ) {
						console.log("Command received: " + response.command);
						// TODO: Do something with Tessel
					}
					
					if ( response.text != null ) {
						console.log("Text received: " + response.text);
						// TODO: Do something with Tessel
					}
					
					if ( response.data != null ) {
						// TODO: Need to do Json.stringify or encode to see the data
						console.log("Data received: " + response.data);
						// TODO: Decode data and do something with Tessel
					}
				}
				
			}
		}
	);
} else {
	console.log("WARNING: PubNub is not available. Possibly due to no internet connection!");
}


