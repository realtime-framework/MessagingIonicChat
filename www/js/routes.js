angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  .state('login', {
    cache: true,
    url: '/page1',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('chatRooms', {
    cache: true,
    url: '/page2',
    templateUrl: 'templates/chatRooms.html',
    controller: 'chatRoomsCtrl'
  })

  .state('chat', {
    cache: true,
    url: '/page3',
    templateUrl: 'templates/chat.html',
    controller: 'chatCtrl'
  })

  .state('writeMessage', {
    cache: true,
    url: '/page4',
    templateUrl: 'templates/writeMessage.html',
    controller: 'writeMessageCtrl'
  })

$urlRouterProvider.otherwise('/page1')

  

});