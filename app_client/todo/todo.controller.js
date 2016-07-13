(function () {
  angular
    .module("todoCalendar")
    .controller("todoCtrl", todoCtrl);

  todoCtrl.$inject = ["utils"];
  function todoCtrl (utils) {
    var vm = this,
        today = new Date(),
        inboxs = JSON.parse(localStorage.getItem("inbox")) || [],
        withDate = JSON.parse(localStorage.getItem("withDate")) || {},
        todayArr = [utils.parseDate(today)],
        upcomingArr = utils.getUpcomingArr(today, 3),
        allArr = Object.keys(withDate).sort().reverse();

    vm.inboxs = utils.getTasks(inboxs, [], false);
    vm.todays = utils.getTasks(withDate, todayArr, false);
    vm.upcomings = utils.getTasks(withDate, upcomingArr, false);
    vm.completeds = utils.getTasks(withDate, allArr, true)
      .concat(utils.getTasks(inboxs, [], true))
      .sort(function(a, b) {return b.checkedOn - a.checkedOn;});
    vm.alls = utils.getTasks(withDate, allArr, false)
      .concat(utils.getTasks(inboxs, [], false))
      .sort(function(a, b) {return b.createdOn - a.createdOn;});

    vm.inboxChange = function() {
      var checked = vm.inboxs.filter(function(value) {
        return value.completed;
      })[0];
      var checkedId = checked.createdOn.toString();
      
      var index = inboxs.indexOf(checked);
      inboxs[index].completed = true;
      inboxs[index].checkedOn = new Date().getTime();
      localStorage.setItem("inbox", JSON.stringify(inboxs));

      var removed = $("#" + checkedId).parent().remove();
      var inboxBadge = $("#inboxHead .badge");
      inboxBadge.html(Number(inboxBadge.html()) - 1);

      var lii = $("#completed .list-group li:first-of-type");
      removed.insertBefore(lii);
      var completedBadge = $("#completedHead .badge");
      completedBadge.html(Number(completedBadge.html()) + 1);
    };
  }
})();
