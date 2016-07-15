(function() {
  angular
    .module("todoCalendar")
    .controller("todoAddCtrl", todoAddCtrl);

  todoAddCtrl.$inject = ["$location", "utils"];
  function todoAddCtrl($location, utils) {
    var vm = this;
    vm.newTask = "";
    vm.begin = {
      liStatus: "active",
      date: "Begins on",
      dateRaw: "",
      time: "Begins at",
      timeRaw: "",
      contentStatus: "tab-pane active"
    };
    vm.end = {
      liStatus: "",
      date: "Ends on",
      dateRaw: "",
      time: "Ends at",
      timeRaw: "",
      contentStatus: "tab-pane"
    };
    vm.clickEnd = function() {
      vm.end.liStatus = "active";
      vm.end.contentStatus = "tab-pane active";
      vm.begin.liStatus = "";
      vm.begin.contentStatus = "tab-pane";
    };
    vm.clickBegin = function() {
      vm.begin.liStatus = "active";
      vm.begin.contentStatus = "tab-pane active";
      vm.end.liStatus = "";
      vm.end.contentStatus = "tab-pane";
    };

    vm.change = function() {
      if(vm.begin.dateRaw) {
        vm.begin.date = utils.addSlash(utils.parseDate(vm.begin.dateRaw));
      }
      if(vm.begin.timeRaw) {
        vm.begin.time = utils.parseTime(vm.begin.timeRaw);
      }
      if(vm.end.dateRaw) {
        vm.end.date = utils.addSlash(utils.parseDate(vm.end.dateRaw));
      }
      if(vm.end.timeRaw) {
        vm.end.time = utils.parseTime(vm.end.timeRaw);
      }
    };

    vm.onSubmit = function() {
      if(vm.newTask && (!vm.begin.dateRaw || !vm.begin.timeRaw || !vm.end.dateRaw || !vm.end.timeRaw)) {
        utils.saveToInbox(vm.newTask);
        $location.path("/todo");
      } else {
        utils.saveToWithDate(vm.newTask, vm.begin.dateRaw, vm.begin.timeRaw, vm.end.dateRaw, vm.end.timeRaw);
        $location.path("/todo");
      }
    };
  }
})();
