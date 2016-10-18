angular.module('app.directives', [])

.directive('ngEnter', [function(){
  return function(scope, elements, attrs) {
    elements.bind('keydown keypress', function(event) {
      if(13 === event.which) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
}]);
