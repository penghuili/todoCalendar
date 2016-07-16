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

    vm.getBeginAndEndDate = function(task) {
      var beginDate = task.beginDate,
          beginTime = task.beginTime,
          endDate = task.endDate,
          endTime = task.endTime,
          beginDateAndTime = vm.numToDate(beginDate, beginTime),
          endDateAndTime = vm.numToDate(endDate, endTime);
      return [beginDateAndTime, endDateAndTime];
    };
    vm.numToDate = function(date, time) {
      var year = date.substring(0,4),
          month = Number(date.substring(4,6)) - 1,
          day = date.substring(6),
          hour = time.substring(0,2),
          minute = time.substring(3,5),
          amOrPm = time.substring(6);
      if(amOrPm === "PM") {
        hour = Number(hour) + 12;
      }
      return new Date(year, month, day, hour, minute);
    };


    var task = utils.getTaskById(vm.id);
    if(task){
      vm.newTask = task.name;
      vm.completed = task.completed;

      vm.raw.name = task.name;
      vm.raw.completed = task.completed;

      if(task.beginDate){
        var beginAndEnd = vm.getBeginAndEndDate(task);
        vm.begin.date = utils.addSlash(task.beginDate);
        vm.begin.time = task.beginTime;
        vm.begin.dateRaw = beginAndEnd[0];
        vm.begin.timeRaw = beginAndEnd[0];
        vm.end.date = utils.addSlash(task.endDate);
        vm.end.time = task.endTime;
        vm.end.dateRaw = beginAndEnd[1];
        vm.end.timeRaw = beginAndEnd[1];

        vm.raw.beginDateRaw = beginAndEnd[0];
        vm.raw.beginTimeRaw = beginAndEnd[0];
        vm.raw.endDateRaw = beginAndEnd[1];
        vm.raw.endTimeRaw = beginAndEnd[1];
      }
    }

    vm.changed = function() {
      return vm.raw.name !== vm.newTask ||
             vm.raw.completed !== vm.completed ||
             vm.raw.beginDateRaw !== vm.begin.dateRaw ||
             vm.raw.beginTimeRaw !== vm.begin.timeRaw ||
             vm.raw.endDateRaw !== vm.end.dateRaw ||
             vm.raw.endTimeRaw !== vm.end.timeRaw;
    };
    vm.onSubmit = function() {
      if(vm.changed()) {
        utils.deleteTaskById(vm.id);
        if(vm.newTask && (!vm.begin.dateRaw || !vm.begin.timeRaw || !vm.end.dateRaw || !vm.end.timeRaw)) {
          utils.saveToInbox(vm.newTask, vm.completed);
        } else {
          utils.saveToWithDate(vm.newTask, vm.begin.dateRaw, vm.begin.timeRaw, vm.end.dateRaw, vm.end.timeRaw, vm.completed);
        }
      }
      $location.path("/todo");
    };

    vm.delete = function() {
      utils.deleteTaskById(vm.id);
      $location.path("/todo");
    };
  }
})();
