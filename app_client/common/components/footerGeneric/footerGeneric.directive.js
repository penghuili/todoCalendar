(function() {
  angular
    .module("todoCalendar")
    .directive("footerGeneric", footerGeneric);

  function footerGeneric() {
    return {
      templateUrl: "common/components/footerGeneric/footerGeneric.view.html"
    };
  }
})();
