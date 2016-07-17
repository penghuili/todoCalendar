(function () {
  angular
    .module("todoCalendar")
    .controller("calendarCtrl", calendarCtrl);

  calendarCtrl.$inject = ["utils"];
  function calendarCtrl(utils) {
    var vm = this;

    vm.date = new Date();
    vm.init = function() {
      $(".taskItem").remove();
      var dateString = utils.timestampToDateString(vm.date.getTime());
      var oneDayTasks = utils.getTasks("someday", dateString);
      oneDayTasks.forEach(vm.addTask);

      $(".taskItem input").on("change", function(event) {
        var id = $(event.currentTarget).parent().attr("id"),
            tmp = id.split("_"),
            beginDate = utils.timestampToDateString(Number(tmp[0])),
            createdOn = Number(tmp[1]),
            database = utils.getDatabase(),
            task = database[beginDate].filter(function(value) {
              return value.createdOn === createdOn;
            })[0];
        task.completed = !task.completed;
        task.checkedOn = new Date().getTime();
        localStorage.setItem("database", JSON.stringify(database));
        vm.init();
      });
    };

    vm.changeDate = function() {
      $(".taskItem").remove();
      vm.init();
    };

    vm.addTask = function(task) {
      var top = vm.getTop(task.begin);
      var height = vm.getHeight(task.begin, task.end);
      var colorArr = vm.getRandomColor();
      var div = $("<div class=taskItem></div>").css({
        "width": "93%",
        "height": height + "px",
        "line-height": height + "px",
        "border": "1px solid rgb(" + colorArr[0] + "," + colorArr[1] + "," + colorArr[2] + ")",
        "border-radius": "4px",
        "position": "absolute",
        "top": top + "px",
        "left": "70px",
        "z-index": "1"
      }).attr("id", task.begin.toString() + "_" + task.createdOn.toString());
      var input = $("<input type=checkbox checked>");
      var due = Number(utils.timestampToDateString(new Date().getTime())) > Number(utils.timestampToDateString(task.begin));
      if(!task.completed && !due) {
        div.css("background", "rgba(127,255,212,0.5)");
        input.removeAttr("checked");
      } else if(task.completed){
        div.css("background", "rgba(0,255,0,0.5)");
      } else {
        div.css("background", "rgba(255,69,0,0.5)");
        input.removeAttr("checked");
      }
      var a = $("<a></a>").attr("href", "/#/todo/" + task.createdOn).html(task.name);
      if(task.completed){
        a = $("<del></del>").html(a);
      }
      div.html([input, "&nbsp;", a]);
      var taskBox = $("#taskBox");
      taskBox.prepend(div);
    };

    vm.getTop = function(timestamp) {
      var date = new Date(timestamp),
          hour = date.getHours(),
          minute = date.getMinutes();
      return hour * 2 * 41 + 2 + 82 * minute / 60;
    };

    vm.getHeight = function(beginTimestamp, endTimestamp) {
      var beginTop = vm.getTop(beginTimestamp);
      var endTop = vm.getTop(endTimestamp);
      return endTop - beginTop - 3;
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
