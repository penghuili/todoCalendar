(function() {
  angular
    .module("todoCalendar")
    .controller("todoAddCtrl", todoAddCtrl);

  function todoAddCtrl() {
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
      var beginDateRaw = vm.begin.dateRaw;
      console.log(beginDateRaw);
      if(beginDateRaw) {
        var beginDate = new Date(beginDateRaw);

        var beginYear = beginDate.getFullYear();
        var beginMonth = beginDate.getMonth() + 1;
        var beginDay = beginDate.getDate();
        var beginTimestamp = beginDate.getTime();

        vm.begin.date = beginMonth + "/" + beginDay + "/" + beginYear;

      }

    };
  }
})();
