(function () {
  angular
    .module("todoCalendar")
    .controller("calendarCtrl", calendarCtrl);

  calendarCtrl.$inject = ["utils"];
  function calendarCtrl(utils) {
    var vm = this,
        withDate = JSON.parse(localStorage.getItem("withDate"));
    vm.date = new Date();
    vm.init = function() {
      var oneDayTasks = utils.getTasks(withDate, [utils.parseDate(vm.date)]);
      oneDayTasks.forEach(vm.addTask);
    };

    vm.change = function() {
      $(".taskItem").remove();
      vm.init();
    };

    vm.addTask = function(task) {
      var beginTimeArr = task.beginTime.split(" ");
      var endTimeArr = task.endTime.split(" ");
      var top = vm.getTop(beginTimeArr);
      var height = vm.getHeight(beginTimeArr, endTimeArr);
      var colorArr = vm.getRandomColor();
      var div = $("<div class=taskItem></div>").css({
        "background": "rgba(127,255,212,0.5)",
        "width": "93%",
        "height": height + "px",
        "line-height": height + "px",
        "border": "1px solid rgb(" + colorArr[0] + "," + colorArr[1] + "," + colorArr[2] + ")",
        "position": "absolute",
        "top": top + "px",
        "left": "70px",
        "z-index": "1"
      });
      var input = $("<input type=checkbox checked>");
      if(!task.completed) {input.removeAttr("checked");}
      div.html([input, "&nbsp;", task.name]);
      var taskBox = $("#taskBox");
      taskBox.prepend(div);
    };

    vm.getTop = function(beginTimeArr) {
      var hourAndMinute = vm.getHourAndMinute(beginTimeArr);
      var top = hourAndMinute[0] * 2 * 41 + 2 + 82 * hourAndMinute[1] / 60;
      return top;
    };

    vm.getHeight = function(beginTimeArr, endTimeArr) {
      var beginTop = vm.getTop(beginTimeArr);
      var endTop = vm.getTop(endTimeArr);
      return endTop - beginTop - 3;
    };

    vm.getHourAndMinute = function(timeArr) {
      var hourAndMinute = timeArr[0].split(":"),
          hour = Number(hourAndMinute[0]),
          minute = Number(hourAndMinute[1]);
      if(timeArr[1] === "PM") {
        hour += 12;
      }
      return [hour, minute];
    };

    vm.getRandomColor = function() {
      var red = vm.getRandomNum();
      var green = vm.getRandomNum();
      var blue = vm.getRandomNum();
      return [red, green, blue];
    };
    vm.getRandomNum = function() {
      return Math.floor(Math.random() * 255 + 1);
    };
  }
})();
