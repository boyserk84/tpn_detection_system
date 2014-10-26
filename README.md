PubNub and Tessel integration (hackathon) project.

Security Detection IOT System

Overview:
This contains a basic framework for informing clients of any unusual sound and light pattern in the environment.

Example of applications:
- This could be used for detecting if intruders/someone enter a room/classified area. 
- Attached to any subject and alert client apps of any change in sound/light environment.

How it works:
Tessel hardware is equipped with Ambient and GPS modules. Everytime there is any unusual sound/light value occurred
(i.e. sudden loud sound or sudden change in light), it will broadcast this information via PubNub Channel.
Any client app (i.e. Mobile App or Desktop web app) will receive this information in real-time and can determine
what to do.

Current iteration
- Notifying client app (Desktop web app) when there is a sudden loud/change in the sound environment where Tessel is located.
- After 5 triggers, Client will send a command to Tessel hardware to execute a security protocol (in this example, blinking LED lights).
- Every time there is a new message/command from the client for Tessel hardware. It will blink its LED lights.


Requirement:
- Tessel hardware	(Installation guide: http://start.tessel.io/install)
	- Ambient Module
	- GPS Module (Optional)
- PubNub account: It's FREE! (http://www.pubnub.com/)
- Node.js command line (http://www.nodejs.org)
- Stable Wifi internet connection for Tessel






