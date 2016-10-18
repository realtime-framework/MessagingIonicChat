# Mobile chat using Ionic and Realtime Messaging

This example shows how to build a cross-platform chat app for iOS and Android using the Ionic Framework and the Realtime Messaging platform.

The app allows users to define chat rooms (or groups) and exchange messages with all the users subscribing the room.

The users that are not using the app when a new message is published will receive a mobile push notification through APNS (iOS) or Firebase Cloud Messaging (Android).

[Ionic](http://ionicframework.com/) is an open source mobile SDK for developing native and progressive web apps.

[Realtime Messaging](https://framework.realtime.co/messaging/) is a cloud based message broker, enabling developers to build cross-platform apps that require realtime communication between devices.

## Running this example
The folowing sub-sections of this guide will show you how to build and run the Ionic/Realtime chat app.

For a more detailed view over the development steps refer to last section of this document.

### Installing Ionic
If you already have Ionic installed you can skip this step.

Install Ionic and create a new project following the instructions available [here](http://ionicframework.com/getting-started/).

As soon as you are able to run the Ionic starting example project you can proceed with the remaining steps.

### Designing the user interface
We have designed the user interface with the [creator.ionic.io](https://creator.ionic.io) tool.

Copy the contents of the `www` folder in this repository to your project `www` folder.

### Adding CordovaPush plugin

CordovaPush is the Realtime Messaging plugin for Ionic, Cordova and PhoneGap frameworks. It enables your app to receive (APNS/FCM) push notifications. 

This plugin will be responsible for sending and receiving the chat messages. It will also handle the push notifications when the users receive a chat message and they are not using the app.

To add the plugin to your project simply enter the following command in your project folder:

	cordova plugin add cordovapush 

If you want more details about this plugin you can check [this GitHub repository](https://github.com/realtime-framework/CordovaPush).

### Getting your Free Realtime Messaging subscription
If you already have a Realtime Messaging subscription you can skip this step.

Click [here](https://accounts.realtime.co/signup/) to register for a Realtime account and subscribe the Realtime Messaging service using the Free plan. 

You'll get a 6 alpha-numeric application key (aka appkey) and make note of it, you'll have to enter it in your app code when the connection to Realtime is established.

### Configuring push notifications

To receive push notifications from APNS (iOS) and Firebase Cloud Messaging (Android), you need to configure both platforms (or only the one you are intending to use) and enter their credentials in the Realtime Account Management website. This way Realtime will be able to send push notifications to your app.

#### Configuring for iOS (APNS)
Take a deep breath and follow [this step-by-step tutorial](http://messaging-public.realtime.co/documentation/starting-guide/mobilePushAPNS.html) to configure your Realtime subscription for iOS push notifications.

#### Configuring for Android (FCM)
It's a bit simpler than the iOS configuration and clearly the best way to go over it is following
[this step-by-step tutorial](http://messaging-public.realtime.co/documentation/starting-guide/mobilePushGCM.html) to configure your Realtime subscription for Firebase Cloud Messaging push notifications.

### Testing the app
Now that you have installed the plugin and configured the iOS and Android push notifications, you are only a few steps away from running our example app:

* Copy the `resources` folder of this repository to your project `resources` folder. This will configure the Android notification icons
* Copy the `www` folder of this repository to your project `www` folder (if you haven't done it already) 
* Edit the file `www/js/controllers.js` and enter your Realtime application key and Firebase Cloud Messaging SenderID in the OrtcPushPlugin.connect method call.

Using the Ionic CLI comamnds, build and run the app in your platform of choice!



## Development steps
In this section we'll guide you through the main steps involved in developing our Ionic/Realtime chat app.

### Creating factories to share data between Ionic views

In file `js/services.js` we added factories to store the chat messages, to manage the currently selected chat and user nickname.

*	Received messages

	To manage the received messages we need to create a factory with the following code: 
	
		.factory('ortcmessages', function() {
			var messages = {};
			var unread = {};
		
			return {
				push: function(message){
					return messages.push(message);
				},
				getMessages: function(){
					return messages;
				},
				incrementUnRead: function(channel){
					unread[channel];
					if (unread[channel] == null) {
						unread[channel] = 0;
					};
					unread[channel] = unread[channel] + 1;
					return unread[channel];
				},
				getUnRead: function(channel){
					return unread[channel];
				},
				resetUnRead: function(channel){
					unread[channel] = 0;
					return unread[channel];
				},
				getAllUnread: function(){
					return unread;
				}
			}
		}) 
		
*	Selected chat and user nickname

	The `SelectedChat` factory provides the name of the selected chat room and the user nickname.
	
		.factory('SelectedChat', function() {
			var selectedChat = '';
			var user = '';
		
			return {
				setSelectedChat: function(channel){
					selectedChat = channel;
					return selectedChat;
				},
				getSelectedChat: function(){
					return selectedChat;
				},
				setUser: function(nick){
					user = nick;
					return nick;
				},
				getUser: function(){
					return user;
				},
			}
		})


### The login view
The starting view of our app.

It will connect to Realtime, request the user to enter a nickname and save it on the device local storage (or use the previously entered nickname if already configured).

The login view controller `loginCtrl` is defined in file `js/controllers.js` and is responsible for connecting to Realtime with the following code: 

	document.addEventListener("deviceready",
	    function () {
	      var OrtcPushPlugin = window.plugins.OrtcPushPlugin;
	      OrtcPushPlugin.connect({
	           'appkey':'INSERT-YOUR-REALTIME-APPKEY',
	           'token':'appToken',
	           'metadata':'ionic chat example',
	           'projectId':'INSERT-YOUR-FCM-SENDERID',
	           'url':'https://ortc-developers.realtime.co/server/ssl/2.1/'
	           }, function(){
	            $scope.isConnect = true;
	            $scope.connected();
	          });                                                  
	    }, 
	    false);
	    
The login view is defined in `templates/login.html` and as soon as the user enters a nickname in the `nickname` input field, the `loginCtrl.updateStorage` function is invoked.

It stores the user nickname in the local storage, set's its value in the `selectedChat` factory and updates the user interface if the Realtime connection is already established:
	
	$scope.updateStorage = function(nickname){
	    window.localStorage.setItem('nickname', nickname);
	    SelectedChat.setUser(nickname);
	    $scope.spanvisible = true;
	    $scope.inputvisible = false;
	    $scope.currentlyStored = nickname;
	    var nickname = document.getElementById("nickname");
	    nickname.parentNode.removeChild(nickname);
	    $scope.connected();
	};

                                   

### Chat rooms view

The chat rooms view is defined in file `templates/chatRooms.html` and its controller `chatRoomsCtrl` in file `js/controllers.js`.

#### Subscribing to chat room channels
This view is responsible for subscribing to new chat rooms as well as listing the chat rooms already subscribed by the user. Each chat room maps to a Realtime pub/sub channel.

These channels are saved in the local storage, so when the view loads, we can iterate the channels list and subscribe them using push notifications with the following code:

	if (window.localStorage.getItem('channels')) {
	      $scope.channels = JSON.parse(window.localStorage.getItem('channels'));
	      for (var i = 0; i < $scope.channels.length; i++) {
	        var channel = $scope.channels[i];
	        $scope.subscribeWithNotifications(channel);
	      };
	  }; 

The `$scope.subscribeWithNotifications` function uses the CordovaPush plugin `subscribe` method to subscribe each chat room channel:

	$scope.subscribeWithNotifications = function(channel){  
	    ortcmessages.resetUnRead(channel);   
	    OrtcPushPlugin.subscribe({'channel':channel}, function (){
	          OrtcPushPlugin.log("subscribe with push channel: " + channel);
	          $scope.$apply();
	      });
	    messages[channel] = [];
	  };

#### Handling incoming chat messages
  
Another important part of the chat rooms controller is handling the incoming chat messages or push notifications. This is achieved by setting a listener for the `push-notification` event. This event is emitted by the CordovaPush plugin when a new message is received:

	document.addEventListener("push-notification", 
	    function(notification)
	    {
	      var parts = notification.payload.split(":");
	      var channelMessages = messages[notification.channel];
	      channelMessages.push({sender:parts[0], msg:parts[1]});
	      var nav = $ionicHistory.currentView();
	      if (nav.stateName !== "chat") {
	        $scope.unread = ortcmessages.getAllUnread();
	        $scope.unread[notification.channel] = $scope.unread[notification.channel] + 1;
	      };
	      OrtcPushPlugin.removeNotifications();
	      $scope.$apply();
	      
	    }, false);
	    

The `push-notification` listener parses the message received (with `[NICKNAME]:[MESSAGE]` format), pushes it to the `ortcmessages` factory message hash, updates the unread count and clears the pending push notifications buffer.

It's also important to call the `checkForNotifications` when the view loads in order to handle any pending messages:

	OrtcPushPlugin.checkForNotifications();

*Please keep in mind this is a simple messaging demo where the chat messages are not persisted outside the device. In a real scenario the chat messages should be saved in a database like [Realtime Cloud Storage](https://framework.realtime.co/storage/) and retrieved when the user selects the chat. This way messages are not lost if the user is not connected to the app and doesn't tap the received push notifications.*

#### Adding a chat room
To add a new chat room we simply subscribe to the new Realtime Pub/Sub channel and add the new channel to local storage channels list.

	$scope.addChannel = function(newChannel){
	    if (newChannel === '') {
	      return;
	    };
	    $scope.channels.push(newChannel);
	    window.localStorage.setItem('channels', JSON.stringify($scope.channels));
	    var channelName = document.getElementById("channel_text");
	    channelName.value = "";
	    $scope.subscribeWithNotifications(newChannel);
	};

#### Deleting a chat room
To delete an existing chat room we simply unsubscribe from the Realtime Pub/Sub channel and remove it from the local storage channels list.

	$scope.removeChannel = function(index) {
		$realtime.unsubscribe($scope.channels[index]);
		OrtcPushPlugin.unsubscribe($scope.channels[index], function(){});
		$scope.channels.splice(index, 1);
		window.localStorage.setItem('channels', JSON.stringify($scope.channels));
	};
	

### Chat messages view
This view is responsible to list the chat messages in a given chat room.

The chat messages view is defined in file `templates/chat.html` and the the controller `chatCtrl` in file `js/controllers.js`.

#### Showing the chat room messages

To show the messages as speach balloons we use the following code:

	<ion-content id="list" padding="true" class="has-header">
      <div ng-repeat="message in channelMessages" style="width: 100%">
          <p class="bubble left" ng-if="message.sender === user"><span style="font-size:30px;">{{message.sender}}:</span></br>{{message.msg}}</p>
          <p class="bubble right" ng-if="message.sender !== user"><span style="font-size:30px;">{{message.sender}}:</span></br>{{message.msg}}</p>
      </div>
    </ion-content>

The balloon "alignment" to the left or right will depend whether the message sender is another user or the current user. To achieve this we are using the Angular `ng-if` directive using the `message.sender` property to make the left/right decision by changing the CSS class used. 


### Composing a new message
When the user composes a new message we send it to the chat room Realtime channel, using the `writeMessageCtrl` controller:
 
	 $scope.sendMessage = function() {
    	var messagetext = document.getElementById("messagetext");
    	OrtcPushPlugin.send({
      		'channel': $scope.channel,
      		'message':'' + SelectedChat.getUser() + ':' + messagetext.value
    	});
    	$scope.myGoBack();
  	};

## Author
Realtime.co
