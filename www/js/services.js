angular.module('app.services', [])

.factory('ortcmessages', function() {
	var messages = {};
	var unread = {};
	var executed = false;

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
		},
		setExecuted: function(exe){
			executed = exe;
		},
		getExecuted: function(){
			return executed;
		}
	}
})

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

.service('chatService', [function(){
	this.selectedChat;
}]);