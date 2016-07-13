(function () {
  angular
    .module("todoCalendar")
    .controller("todoCtrl", todoCtrl);

  todoCtrl.$inject = ["utils"];
  function todoCtrl (utils) {
    var vm = this;
    vm.getTasks = function(obj, dateArr, completed) {
      var tasks = [],
          len = dateArr.length,
          i = 0,
          checkCompleted = function(value) {
            return value.completed === completed;
          };
      for(i = 0; i < len; i++) {
        obj[dateArr[i]] = obj[dateArr[i]] || [];
        tasks = tasks.concat(obj[dateArr[i]].filter(checkCompleted));
      }
      return tasks;
    };
    vm.getUpcomingArr = function(date, threshold) {
      var tmp = new Date(date),
          upArr = [],
          i = 0;
      while(i < threshold) {
        tmp.setDate(tmp.getDate() + 1);
        upArr.unshift(utils.parseDate(tmp));
        i++;
      }
      return upArr;
    };

    var today = new Date(),
        withDate = JSON.parse(localStorage.getItem("withDate")) || {},
        todayArr = [utils.parseDate(today)],
        upcomingArr = vm.getUpcomingArr(today, 3),
        allArr = Object.keys(withDate).sort().reverse();

    vm.inboxs = JSON.parse(localStorage.getItem("inbox")) || [];
    vm.todays = vm.getTasks(withDate, todayArr, false);
    vm.upcomings = vm.getTasks(withDate, upcomingArr, false);
    vm.completeds = vm.getTasks(withDate, allArr, true);
    vm.alls = vm.getTasks(withDate, allArr, false);


  }
})();
