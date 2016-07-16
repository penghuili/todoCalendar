(function() {
  angular
    .module("todoCalendar")
    .directive("navigation", navigation);

  function navigation() {
    return {
      templateUrl: "common/directive/navigation/navigation.view.html",
      controller: "navigationCtrl as navvm"
    };
  }
})();
