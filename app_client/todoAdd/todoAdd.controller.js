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
      date: "Begins on:",
      dateRaw: "",
      time: "Begins at:",
      timeRaw: "",
      contentStatus: "tab-pane active"
    };
    vm.end = {
      status: "",
      date: "Ends on:",
      dateRaw: "",
      time: "Ends at:",
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
    vm.onSubmit = function() {
      vm.inbox = JSON.parse(localStorage.getItem("inbox")) || [];
      vm.withDate = JSON.parse(localStorage.getItem("withDate")) || {};
      var now = new Date().getTime();

      var beginDateRaw = vm.begin.dateRaw,
        beginTimeRaw = vm.begin.timeRaw,
        endDateRaw = vm.end.dateRaw,
        endTimeRaw = vm.end.timeRaw;

      if(vm.newTask && (!beginDateRaw || !beginTimeRaw || !endDateRaw || !endTimeRaw)) {
        vm.inbox.unshift({name: vm.newTask, createdOn: now, completed: false});
        localStorage.setItem("inbox", JSON.stringify(vm.inbox));
        $location.path("/todo");
        return;
      }

      if(vm.newTask && beginDateRaw && beginTimeRaw && endDateRaw && endTimeRaw) {
        var beginDate = utils.parseDate(new Date(beginDateRaw)),
          beginTime = utils.parseDate(new Date(beginTimeRaw)),
          endDate = utils.parseDate(new Date(endDateRaw)),
          endTime = utils.parseTime(new Date(endTimeRaw));

        vm.begin.date = utils.addSlash(beginDate);
        vm.begin.time = beginTime;
        vm.end.date = utils.addSlash(endDate);
        vm.end.time = endTime;

        if(!vm.withDate[beginDate]) {
          vm.withDate[beginDate] = [];
        }
        vm.withDate[beginDate].unshift({
          name: vm.newTask,
          createdOn: now,
          completed: false,
          beginDate: vm.begin.date,
          beginTime: vm.begin.time,
          endDate: vm.end.date,
          endTime: vm.end.time});

        localStorage.setItem("withDate", JSON.stringify(vm.withDate));
        $location.path("/todo");
        return;
      }
    };
  }
})();
