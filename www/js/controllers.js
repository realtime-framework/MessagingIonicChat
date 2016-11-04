angular.module('app.controllers', ['ionic', 'app.services', 'realtime'])

// *******************************************************
// LOGIN CONTROLLER 
// Handles the user nickname and connects to Realtime
// *******************************************************

.controller('loginCtrl', ['$scope', '$stateParams', '$realtime', 'SelectedChat', '$state',

function ($scope, $stateParams, $realtime, SelectedChat, $state) {
  $scope.currentlyStored = "Please insert your NickName!!!";
  $scope.spanvisible = false;
  $scope.inputvisible = true;
  $scope.chatroomsdisable = true;
  $scope.isConnect = false;
  $scope.isConnected = "Not connect";

  $scope.gotoChatRooms = function(){
    $state.go('chatRooms');
  };

  $scope.connected = function(){
    if ($scope.currentlyStored !== "Please insert your NickName!!!" && $scope.isConnect == true) {
      $scope.chatroomsdisable = false;
      $scope.isConnected = "Got Connected";
      $scope.chatroomsdisable = false;
      $scope.$apply();
    };
  }
  
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

  if (window.localStorage.getItem('nickname') != null) {
    $scope.currentlyStored = window.localStorage.getItem('nickname');
    SelectedChat.setUser(window.localStorage.getItem('nickname'));
    $scope.spanvisible = true;
    $scope.inputvisible = false;
    $scope.connected();
  };

  
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
    // sets notifications mode to heads-up
    OrtcPushPlugin.enableHeadsUpNotifications();
    }, 
    false);
}])

// **********************************************************************************
// CHAT ROOMS CONTROLLER
// Manages the chat rooms (lists chat rooms, new chat room and delete chat room)
// **********************************************************************************

.controller('chatRoomsCtrl', ['$scope', '$stateParams', 'ortcmessages','$realtime','SelectedChat', '$ionicHistory', '$ionicNavBarDelegate',

function ($scope, $stateParams, ortcmessages, $realtime, SelectedChat, $ionicHistory, $ionicNavBarDelegate) {
  $ionicNavBarDelegate.showBackButton(false);
  $scope.channels = [];
  var messages = ortcmessages.getMessages();
  var OrtcPushPlugin = window.plugins.OrtcPushPlugin;

  $scope.visibleAddChannels = false;
  $scope.addChannels = function(){
      $scope.visibleAddChannels = true;
  };
  $scope.done = function(){
      $scope.visibleAddChannels = false;
  }

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

  $scope.removeChannel = function(index) {
    $realtime.unsubscribe($scope.channels[index]);
    OrtcPushPlugin.unsubscribe({'channel':$scope.channels[index]}, function(){});
    $scope.channels.splice(index, 1);
    window.localStorage.setItem('channels', JSON.stringify($scope.channels));
  };

  $scope.selectedChannel = function(index){
    SelectedChat.setSelectedChat($scope.channels[index]);
  };

  $scope.subscribeWithNotifications = function(channel){  
    ortcmessages.resetUnRead(channel);   
    OrtcPushPlugin.subscribe({'channel':channel}, function (){
          OrtcPushPlugin.log("subscribe with push channel: " + channel);
          $scope.$apply();
      });
    messages[channel] = [];
  };

  // Iterate through the channels saved and subscribe them with notifications
  if (window.localStorage.getItem('channels')) {
      $scope.channels = JSON.parse(window.localStorage.getItem('channels'));
      for (var i = 0; i < $scope.channels.length; i++) {
        var channel = $scope.channels[i];
        $scope.subscribeWithNotifications(channel);
      };
  };

  $scope.unread = ortcmessages.getAllUnread();

  // Listener to receive incoming messages or push notifications
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
  
  // check for any pending push notifications
  OrtcPushPlugin.checkForNotifications();
  
}])
   

// *******************************************************
// CHAT CONTROLLER
// Handles the messages of a specific chat room
// *******************************************************

.controller('chatCtrl', ['$scope', '$stateParams', 'ortcmessages', 'SelectedChat', '$realtime', '$ionicHistory', '$ionicNavBarDelegate',

function ($scope, $stateParams, ortcmessages, SelectedChat, $realtime, $ionicHistory, $ionicNavBarDelegate) {
  $scope.channel = SelectedChat.getSelectedChat();
  $scope.channelMessages = ortcmessages.getMessages()[$scope.channel];
  $scope.user = SelectedChat.getUser();
  ortcmessages.resetUnRead(SelectedChat.getSelectedChat());

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };
}])


// *******************************************************
// NEW MESSAGE CONTROLLER
// Sends a new chat message
// *******************************************************

.controller('writeMessageCtrl', ['$scope', '$stateParams', 'ortcmessages', 'SelectedChat', '$realtime', '$ionicHistory',

function ($scope, $stateParams, ortcmessages, SelectedChat, $realtime, $ionicHistory) {
  $scope.channel = SelectedChat.getSelectedChat();
  var OrtcPushPlugin = window.plugins.OrtcPushPlugin;

  $scope.sendMessage = function(){
    var messagetext = document.getElementById("messagetext");
    OrtcPushPlugin.send({
      'channel': $scope.channel,
      'message':'' + SelectedChat.getUser() + ':' + messagetext.value
    });

    $scope.myGoBack();
  };

  $scope.myGoBack = function() {
    $ionicHistory.goBack();
  };

}])









 
