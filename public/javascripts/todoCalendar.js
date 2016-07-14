(function () {

  angular.module("todoCalendar", ["ngRoute"]);

  config.$inject = ["$routeProvider", "$locationProvider"];
  function config($routeProvider, $locationProvider) {
    $routeProvider
      .when("/", {
        templateUrl: "home/home.view.html",
        controller: "homeCtrl",
        controllerAs: "vm"
      })
      .when("/todo", {
        templateUrl: "todo/todo.view.html",
        controller: "todoCtrl",
        controllerAs: "vm"
      })
      .when("/todo/add", {
        templateUrl: "todoAdd/todoAdd.view.html",
        controller: "todoAddCtrl",
        controllerAs: "vm"
      })
      .when("/calendar", {
        templateUrl: "calendar/calendar.view.html",
        controller: "calendarCtrl",
        controllerAs: "vm"
      })
      .otherwise({redirectTo: "/"});
    $locationProvider.html5Mode(true);
  }

  angular
    .module("todoCalendar")
    .config(["$routeProvider", "$locationProvider", config]);

})();

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

(function() {

  angular
    .module("todoCalendar")
    .controller("homeCtrl", homeCtrl);

  function homeCtrl() {
    var vm = this;
    vm.title = "TodoCalendar";
  }

})();

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
          beginTime = utils.parseTime(new Date(beginTimeRaw)),
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

(function() {

  angular
    .module("todoCalendar")
    .service("utils", utils);

  function utils() {
    var addZero = function(num) {
      if(num < 10) {
        return "0" + num.toString();
      }
      return num.toString();
    };

    var amOrPm = function(hour) {
      if(hour > 12) {
        return [addZero(hour - 12), "PM"];
      }
      return [addZero(hour), "AM"];
    };

    var addSlash = function(date) {
      var year = date.substring(0,4),
        month = date.substring(4,6),
        day = date.substring(6);
      return month + "/" + day + "/" + year;
    };

    var parseDate = function(date) {
      var year = date.getFullYear().toString(),
        month = addZero(date.getMonth() + 1),
        day = addZero(date.getDate());
      return year + month + day;
    };

    var parseTime = function(time) {
      var hour = amOrPm(time.getHours()),
        minutes = addZero(time.getMinutes());
      return hour[0] + ":" + minutes + " " + hour[1];
    };

    var getUpcomingArr = function(date, threshold) {
      var tmp = new Date(date),
          upArr = [],
          i = 0;
      while(i < threshold) {
        tmp.setDate(tmp.getDate() + 1);
        upArr.unshift(parseDate(tmp));
        i++;
      }
      return upArr;
    };

    var getTasks = function(obj, dateArr, completed) {
      var tasks = [],
          len = dateArr.length,
          i = 0,
          checkCompleted = function(value) {
            return value.completed === completed;
          };
      if(completed === undefined) {
        checkCompleted = function(value){return true;};
      }
      if(obj.length + 1) {
        tasks = obj.filter(checkCompleted);
      } else {
        for(i = 0; i < len; i++) {
          obj[dateArr[i]] = obj[dateArr[i]] || [];
          tasks = tasks.concat(obj[dateArr[i]].filter(checkCompleted));
        }
      }
      return tasks;
    };

    return {
      parseDate: parseDate,
      parseTime: parseTime,
      getUpcomingArr: getUpcomingArr,
      getTasks: getTasks,
      addSlash: addSlash
    };
  }

})();

(function() {
  angular
    .module("todoCalendar")
    .directive("footerGeneric", footerGeneric);

  function footerGeneric() {
    return {
      templateUrl: "common/directive/footerGeneric/footerGeneric.view.html"
    };
  }
})();
