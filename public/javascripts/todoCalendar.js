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
      .when("/todo/:id", {
        templateUrl: "todoDetail/todoDetail.view.html",
        controller: "todoCtrl",
        controllerAs: "vm"
      })
      .when("/add", {
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
    var vm = this;

    vm.date = new Date();
    vm.init = function() {
      var withDate = JSON.parse(localStorage.getItem("withDate"));
      var oneDayTasks = utils.getTasks(withDate, [utils.parseDate(vm.date)]);
      oneDayTasks.forEach(vm.addTask);
      $(".taskItem input").on("change", function(event) {
        var id = $(event.currentTarget).parent().attr("id"),
            beginDate = id.substring(0, 8),
            createdOn = Number(id.substring(8)),
            withDate = JSON.parse(localStorage.getItem("withDate")),
            task = withDate[beginDate].filter(function(value) {
              return value.createdOn === createdOn;
            })[0];
        task.completed = !task.completed;
        task.checkedOn = new Date().getTime();
        localStorage.setItem("withDate", JSON.stringify(withDate));
      });
    };

    vm.changeDate = function() {
      $(".taskItem").remove();
      vm.init();
    };

    vm.addTask = function(task) {
      var beginTimeArr = task.beginTime.split(" ");
      var endTimeArr = task.endTime.split(" ");
      var top = vm.getTop(beginTimeArr);console.log(top);
      var height = vm.getHeight(beginTimeArr, endTimeArr);
      var colorArr = vm.getRandomColor();
      var div = $("<div class=taskItem></div>").css({
        "width": "93%",
        "height": height + "px",
        "line-height": height + "px",
        "border": "1px solid rgb(" + colorArr[0] + "," + colorArr[1] + "," + colorArr[2] + ")",
        "position": "absolute",
        "top": top + "px",
        "left": "70px",
        "z-index": "1"
      }).attr("id", task.beginDate + task.createdOn);
      var input = $("<input type=checkbox checked>");
      if(!task.completed) {
        div.css("background", "rgba(127,255,212,0.5)");
        input.removeAttr("checked");
      } else {
        div.css("background", "rgba(169,169,169,0.5)");
      }
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
        vm.saveStatusInInbox(checked);
      } else if(box === "today") {
        checked = vm.getChecked(vm.todays, true);
        vm.saveStatusInWithDate(checked);
      } else if(box === "upcoming") {
        checked = vm.getChecked(vm.upcomings, true);
        vm.saveStatusInWithDate(checked);
      } else if(box === "all") {
        checked = vm.getChecked(vm.alls, true);
        if(checked.beginDate) {
          vm.saveStatusInWithDate(checked);
        } else {
          vm.saveStatusInInbox(checked);
        }
      } else if (box === "completed") {
        checked = vm.getChecked(vm.completeds, false);
        if(checked.beginDate) {
          vm.saveStatusInWithDate(checked);
        } else {
          vm.saveStatusInInbox(checked);
        }
      }
      vm.init();
    };

    vm.getChecked = function (arr, completed) {
      return arr.filter(function(value) {
        return value.completed === completed;
      })[0];
    };

    vm.saveStatusInInbox = function(checked) {
      var inboxs = JSON.parse(localStorage.getItem("inbox")) || [];
      var checkedInInbox = inboxs.filter(function(value){
        return value.createdOn === checked.createdOn;
      })[0];
      checkedInInbox.completed = !checkedInInbox.completed;
      checkedInInbox.checkedOn = new Date().getTime();
      localStorage.setItem("inbox", JSON.stringify(inboxs));
    };
    vm.saveStatusInWithDate = function(checked) {
      var withDate = JSON.parse(localStorage.getItem("withDate")) || {};
      var tmp = checked.beginDate.split("/");
      var beginDate = tmp[2] + tmp[0] + tmp[1];
      var checkeInWithDate = withDate[beginDate].filter(function(value) {
        return value.createdOn === checked.createdOn;
      })[0];
      checkeInWithDate.completed = !checkeInWithDate.completed;
      checkeInWithDate.checkedOn = new Date().getTime();
      localStorage.setItem("withDate", JSON.stringify(withDate));
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
      liStatus: "",
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

    vm.change = function() {
      if(vm.begin.dateRaw) {
        vm.begin.date = utils.addSlash(utils.parseDate(vm.begin.dateRaw));
      }
      if(vm.begin.timeRaw) {
        vm.begin.time = utils.parseTime(vm.begin.timeRaw);
      }
      if(vm.end.dateRaw) {
        vm.end.date = utils.addSlash(utils.parseDate(vm.end.dateRaw));
      }
      if(vm.end.timeRaw) {
        vm.end.time = utils.parseTime(vm.end.timeRaw);
      }
    };

    vm.onSubmit = function() {
      if(vm.newTask && (!vm.begin.dateRaw || !vm.begin.timeRaw || !vm.end.dateRaw || !vm.end.timeRaw)) {
        vm.saveToInbox();
      } else {
        vm.saveToWithDate();
      }
    };

    vm.saveToInbox = function() {
      var inbox = JSON.parse(localStorage.getItem("inbox")) || [];
      inbox.unshift({name: vm.newTask, createdOn: new Date().getTime(), completed: false});
      localStorage.setItem("inbox", JSON.stringify(inbox));
      $location.path("/todo");
    };

    vm.saveToWithDate = function() {
      var withDate = JSON.parse(localStorage.getItem("withDate")) || {},
          beginDate = utils.parseDate(new Date(vm.begin.dateRaw)),
          beginTime = utils.parseTime(new Date(vm.begin.timeRaw)),
          endDate = utils.parseDate(new Date(vm.end.dateRaw)),
          endTime = utils.parseTime(new Date(vm.end.timeRaw));
      if(!withDate[beginDate]) {
        withDate[beginDate] = [];
      }
      withDate[beginDate].unshift({
        name: vm.newTask,
        createdOn: new Date().getTime(),
        completed: false,
        beginDate: beginDate,
        beginTime: beginTime,
        endDate: endDate,
        endTime: endTime});
      localStorage.setItem("withDate", JSON.stringify(withDate));
      $location.path("/todo");
    };
  }
})();

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
