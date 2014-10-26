h1 PubNub and Tessel integration (hackathon) project.

h2 Security Detection IOT System

h3 Overview:
- This contains a basic framework for informing clients of any unusual sound and light pattern in the environment.

h3 Example of applications:
- This could be used for detecting if intruders/someone enter a room/classified area. 
- Attached to any subject and alert client apps of any change in sound/light environment.

h3 How it works:
- Tessel hardware is equipped with Ambient and GPS modules. Everytime there is any unusual sound/light value occurred
(i.e. sudden loud sound or sudden change in light), it will broadcast this information via PubNub Channel.
Any client app (i.e. Mobile App or Desktop web app) will receive this information in real-time and can determine
what to do.

h3 Current iteration (10/25/2014)
- Notifying client app (Desktop web app) when there is a sudden loud/change in the sound environment where Tessel is located.
- After 5 triggers, Client will send a command to Tessel hardware to execute a security protocol (in this example, blinking LED lights).
- Every time there is a new message/command from the client for Tessel hardware. It will blink its LED lights.


h3 Requirement:
- Tessel hardware	(Installation guide: http://start.tessel.io/install)
	- Ambient Module
	- GPS Module (Optional)
- PubNub account: It's FREE! (http://www.pubnub.com/)
- Node.js command line (http://www.nodejs.org)
- Stable Wifi internet connection for Tessel


h3 How to setup Tessel development environment
- Make sure to connect modules to the correct Tessel ports. There are 4 ports (A,B,C, and D) in Tessel hardware. (see start.tessel.io/modules)
- Make sure to install Tessel driver, please follow this guide http://start.tessel.io/install
- Make sure to install node.js command line
- Connect your Tessel via USB port
- Open a command line (If windows, open it via node.js command line)


h4 Run the following commands:

1.) brew install node	(Skip this, if you've already install node.js)

2.) npm install -g tessel	// Install Tessel driver

3.) tessel update		// This will update firmware/driver.

4.) npm install pubnub		// Install PubNub on your tessel device (if haven't)
NOTE: For PubNub/Tessel sponsored hackathon event, you may need to change it to npm install pubnub-hackathon.

5.) Install module drivers/dependencies
Ambient Module: npm install ambient-attx4
GPS Module: npm install gps-a2235h

6.) To get your Tessel connect to Wifi Internet,
tessel wifi -n [WIFI_NETWORK_NAME] -p [WIFI_PASSWORD]

7.) Deploying the example code to Tessel hardware
tessel run [YOUR_TESSEL_JS_FILE]
In this case, tessel run hack.js

More information: http://www.pubnub.com/blog/tessel-pubnub-power-internet-of-things-4-lines-javascript/







