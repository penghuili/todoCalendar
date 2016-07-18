(function() {
  angular
    .module("todoCalendar")
    .controller("todoDetailCtrl", todoDetailCtrl);

  todoDetailCtrl.$inject = ["$routeParams", "utils", "$location"];
  function todoDetailCtrl($routeParams, utils, $location) {
    var vm = this;
    vm.raw = {};
    vm.id = Number($routeParams.id);
    vm.begin = {
      liStatus: "active",
      contentStatus: "tab-pane active",
      date: "Begins on",
      time: "Begins at"
    };
    vm.end = {
      liStatus: "",
      contentStatus: "tab-pane",
      date: "Begins on",
      time: "Begins at"
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

    var task = utils.getTaskById(vm.id);console.log(task);
    if(task){
      vm.newTask = task.name;
      vm.completed = task.completed;

      vm.raw.name = task.name;
      vm.raw.completed = task.completed;

      if(task.begin){
        vm.begin.dateRaw = new Date(task.begin);
        vm.begin.timeRaw = new Date(task.begin);
        vm.begin.date = utils.timestampToDateWithSlash(task.begin);
        vm.begin.time = utils.timestampToTimeWithAM(task.begin);

        vm.end.dateRaw = new Date(task.end);
        vm.end.timeRaw = new Date(task.end);
        vm.end.date = utils.timestampToDateWithSlash(task.end);
        vm.end.time = utils.timestampToTimeWithAM(task.end);

        vm.raw.beginDateRaw = new Date(task.begin);
        vm.raw.endDateRaw = new Date(task.end);
      }
    }

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

    vm.changed = function() {
      return vm.raw.name !== vm.newTask ||
             vm.raw.completed !== vm.completed ||
             vm.raw.beginDateRaw !== vm.begin.dateRaw ||
             vm.raw.beginDateRaw !== vm.begin.timeRaw ||
             vm.raw.endDateRaw !== vm.end.dateRaw ||
             vm.raw.endDateRaw !== vm.end.timeRaw;
    };
    vm.onSubmit = function() {
      if(vm.changed()) {
        utils.deleteTaskById(vm.id);
        utils.saveNewTask(vm.newTask, vm.begin.dateRaw, vm.begin.timeRaw, vm.end.dateRaw, vm.end.timeRaw, vm.completed);
      }
      $location.path("/todo");
    };

    vm.delete = function() {
      var beginDate;
      if(vm.begin.dateRaw) {
        beginDate = utils.timestampToDateString(vm.begin.dateRaw.getTime());
      }
      utils.deleteTaskById(vm.id, beginDate);
      $location.path("/todo");
    };
  }
})();
