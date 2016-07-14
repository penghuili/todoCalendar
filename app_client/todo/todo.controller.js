(function () {
  angular
    .module("todoCalendar")
    .controller("todoCtrl", todoCtrl);

  todoCtrl.$inject = ["utils"];
  function todoCtrl (utils) {
    var vm = this;

    vm.init = function() {
      var today = new Date(),
          inboxs = JSON.parse(localStorage.getItem("inbox")) || [],
          withDate = JSON.parse(localStorage.getItem("withDate")) || {},
          todayArr = [utils.parseDate(today)],
          upcomingArr = utils.getUpcomingArr(today, 3),
          allWithDateArr = Object.keys(withDate).sort().reverse();

      vm.inboxs = utils.getTasks(inboxs, [], false);
      vm.todays = utils.getTasks(withDate, todayArr, false);
      vm.upcomings = utils.getTasks(withDate, upcomingArr, false);
      vm.completeds = utils.getTasks(withDate, allWithDateArr, true)
        .concat(utils.getTasks(inboxs, [], true))
        .sort(function(a, b) {return b.checkedOn - a.checkedOn;});
      vm.alls = utils.getTasks(withDate, allWithDateArr, false)
        .concat(utils.getTasks(inboxs, [], false))
        .sort(function(a, b) {return b.createdOn - a.createdOn;});
    };

    vm.change = function(box) {
      var checked;
      if(box === "inbox") {
        checked = vm.getChecked(vm.inboxs, true);
        vm.saveStatusInInbox(checked, true);
      } else if(box === "today") {
        checked = vm.getChecked(vm.todays, true);
        vm.saveStatusInWithDate(checked, true);
      } else if(box === "upcoming") {
        checked = vm.getChecked(vm.upcomings, true);
        vm.saveStatusInWithDate(checked, true);
      } else if(box === "all") {
        checked = vm.getChecked(vm.alls, true);
        if(checked.beginDate) {
          vm.saveStatusInWithDate(checked, true);
        } else {
          vm.saveStatusInInbox(checked, true);
        }
      } else if (box === "completed") {
        checked = vm.getChecked(vm.completeds, false);
        if(checked.beginDate) {
          vm.saveStatusInWithDate(checked, false);
        } else {
          vm.saveStatusInInbox(checked, false);
        }
      }
      vm.init();
    };

    vm.getChecked = function (arr, completed) {
      return arr.filter(function(value) {
        return value.completed === completed;
      })[0];
    };

    vm.saveStatusInInbox = function(checked, changeTo) {
      var inboxs = JSON.parse(localStorage.getItem("inbox")) || [];
      var checkedInInbox = inboxs.filter(function(value){
        return value.createdOn === checked.createdOn;
      })[0];
      checkedInInbox.completed = changeTo;
      checkedInInbox.checkedOn = new Date().getTime();
      localStorage.setItem("inbox", JSON.stringify(inboxs));
    };
    vm.saveStatusInWithDate = function(checked, changeTo) {
      var withDate = JSON.parse(localStorage.getItem("withDate")) || {};
      var tmp = checked.beginDate.split("/");
      var beginDate = tmp[2] + tmp[0] + tmp[1];
      var checkeInWithDate = withDate[beginDate].filter(function(value) {
        return value.createdOn === checked.createdOn;
      })[0];
      checkeInWithDate.completed = changeTo;
      checkeInWithDate.checkedOn = new Date().getTime();
      localStorage.setItem("withDate", JSON.stringify(withDate));
    };
  }
})();
