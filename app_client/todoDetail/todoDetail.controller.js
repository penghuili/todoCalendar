(function() {
  angular
    .module("todoCalendar")
    .controller("todoDetailCtrl", todoDetailCtrl);

  todoDetailCtrl.$inject = ["$routeParams", "utils"];
  function todoDetailCtrl($routeParams, utils) {
    var vm = this;
    vm.id = $routeParams.id;


    var inboxs = JSON.parse(localStorage.getItem("inbox")) || [],
        tmp = vm.findTask(inboxs),
        task = tmp ? tmp : vm.findTaskInObj(JSON.parse(localStorage.getItem("withDate")) || {});
    if(task){
      vm.newTask = task.name;
      if(task.beginDate){
        var beginAndEnd = vm.getBeginAndEndDate(task);
        vm.begin = {
          date: utils.parseDate(task.beginDate),
          time: task.beginTime,
          dateRaw: beginAndEnd[0],
          timeRaw: beginAndEnd[0]
        };
        vm.end = {
          date: utils.parseDate(task.endDate),
          time: task.endTime,
          dateRaw: beginAndEnd[1],
          timeRaw: beginAndEnd[1]
        };
      }
    }

    vm.findTaskInArr = function(arr) {
      return arr.filter(function(value) {
        return value.createdOn === Number(vm.id);
      })[0];
    };

    vm.findTaskInObj = function(obj) {
      var task;
      for(var i in obj) {
        task = vm.findTaskInArr(obj[i]);
        if(task){break;}
      }
      return task;
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
          month = date.substring(4,6),
          day = date.substring(6),
          hour = time.substring(0,2),
          minute = time.substring(3,5),
          amOrPm = time.substring(6);
      if(amOrPm === "PM") {
        hour = Number(hour) + 12;
      }
      return new Date(year, month, day, hour, minute);
    };
  }
})();
