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
        vm.begin.date = utils.timestampToDateWithSlash(vm.begin.dateRaw.getTime());
      }
      if(vm.begin.timeRaw) {
        vm.begin.time = utils.timestampToTimeWithAM(vm.begin.timeRaw.getTime());
      }
      if(vm.end.dateRaw) {
        vm.end.date = utils.timestampToDateWithSlash(vm.end.dateRaw.getTime());
      }
      if(vm.end.timeRaw) {
        vm.end.time = utils.timestampToTimeWithAM(vm.end.timeRaw.getTime());
      }
    };

    vm.onSubmit = function() {
      utils.saveNewTask(vm.newTask, vm.begin.dateRaw, vm.begin.timeRaw, vm.end.dateRaw, vm.end.timeRaw);
      $location.path("/todo");
    };
  }
})();
