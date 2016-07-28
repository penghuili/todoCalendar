(function () {
  angular
    .module("todoCalendar")
    .controller("navigationCtrl", navigationCtrl);

  function navigationCtrl() {
    var vm = this;
    vm.hidePanelBody = function () {
      $(".navbar-toggle").click();
    };
  }
})();
