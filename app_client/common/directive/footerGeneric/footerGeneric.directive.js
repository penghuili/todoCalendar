(function() {
  angular
    .module("todoCalendar")
    .directive("footerGeneric", footerGeneric);

  function footerGeneric() {
    return {
      templateUrl: "common/directive/footerGeneric/footerGeneric.view.html"
    };
  }
})();
