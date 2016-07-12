(function () {
  angular
    .module("todoCalendar")
    .controller("todoCtrl", todoCtrl);

  function todoCtrl () {
    var vm = this;
    vm.inboxs = [{name: "gulp"}, {name: "javascript"}];
  }
})();
