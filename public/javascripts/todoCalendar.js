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
        controller: "todoDetailCtrl",
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
      $(".taskItem").remove();
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
        vm.init();
      });
    };

    vm.changeDate = function() {
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
        "width": "93%",
        "height": height + "px",
        "line-height": height + "px",
        "border": "1px solid rgb(" + colorArr[0] + "," + colorArr[1] + "," + colorArr[2] + ")",
        "border-radius": "4px",
        "position": "absolute",
        "top": top + "px",
        "left": "70px",
        "z-index": "1"
      }).attr("id", task.beginDate + task.createdOn);
      var input = $("<input type=checkbox checked>");
      var due = Number(utils.parseDate(new Date())) > Number(task.beginDate);
      if(!task.completed && !due) {
        div.css("background", "rgba(127,255,212,0.5)");
        input.removeAttr("checked");
      } else if(task.completed){
        div.css("background", "rgba(0,255,0,0.5)");
      } else {
        div.css("background", "rgba(255,69,0,0.5)");
        input.removeAttr("checked");
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
      date: "Begins on",
      dateRaw: "",
      time: "Begins at",
      timeRaw: "",
      contentStatus: "tab-pane active"
    };
    vm.end = {
      liStatus: "",
      date: "Ends on",
      dateRaw: "",
      time: "Ends at",
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
        utils.saveToInbox(vm.newTask);
        $location.path("/todo");
      } else {
        utils.saveToWithDate(vm.newTask, vm.begin.dateRaw, vm.begin.timeRaw, vm.end.dateRaw, vm.end.timeRaw);
        $location.path("/todo");
      }
    };
  }
})();

(function() {
  angular
    .module("todoCalendar")
    .controller("todoDetailCtrl", todoDetailCtrl);

  todoDetailCtrl.$inject = ["$routeParams", "utils", "$location"];
  function todoDetailCtrl($routeParams, utils, $location) {
    var vm = this;
    vm.id = Number($routeParams.id);
    vm.begin = {
      liStatus: "active",
      contentStatus: "tab-pane active",
      date: "Begins on",
      time: "Begins at"
    };
    vm.end = {
      liStatus: "",
      contentStatus: "tab-pane",
      date: "Begins on",
      time: "Begins at"
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
          month = Number(date.substring(4,6)) - 1,
          day = date.substring(6),
          hour = time.substring(0,2),
          minute = time.substring(3,5),
          amOrPm = time.substring(6);
      if(amOrPm === "PM") {
        hour = Number(hour) + 12;
      }
      return new Date(year, month, day, hour, minute);
    };


    var task = utils.getTaskById(vm.id);
    if(task){
      vm.newTask = task.name;
      if(task.beginDate){
        var beginAndEnd = vm.getBeginAndEndDate(task);
        vm.begin.date = utils.addSlash(task.beginDate);
        vm.begin.time = task.beginTime;
        vm.begin.dateRaw = beginAndEnd[0];
        vm.begin.timeRaw = beginAndEnd[0];
        vm.end.date = utils.addSlash(task.endDate);
        vm.end.time = task.endTime;
        vm.end.dateRaw = beginAndEnd[1];
        vm.end.timeRaw = beginAndEnd[1];
        vm.completed = task.completed;
      }
    }

    vm.onSubmit = function() {
      utils.deleteTaskById(vm.id);
      if(vm.newTask && (!vm.begin.dateRaw || !vm.begin.timeRaw || !vm.end.dateRaw || !vm.end.timeRaw)) {
        utils.saveToInbox(vm.newTask, vm.completed);
        $location.path("/todo");
      } else {
        utils.saveToWithDate(vm.newTask, vm.begin.dateRaw, vm.begin.timeRaw, vm.end.dateRaw, vm.end.timeRaw, vm.completed);
        $location.path("/todo");
      }
    };

    vm.delete = function() {
      utils.deleteTaskById(vm.id);
      $location.path("/todo");
    };
  }
})();

(function() {

  angular
    .module("todoCalendar")
    .service("utils", utils);

  function utils() {
    //helper functions begin
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

    var findTaskInArr = function(arr, id) {
      return arr.filter(function(value) {
        return value.createdOn === id;
      })[0];
    };

    var findTaskInObj = function(obj, id) {
      var task;
      for(var i in obj) {
        task = findTaskInArr(obj[i], id);
        if(task){break;}
      }
      return task;
    };
    //helper function end


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

    var getTaskById = function(id) {
      var task;
      var inbox = JSON.parse(localStorage.getItem("inbox")) || [];
      task = findTaskInArr(inbox, id);
      if(!task) {
        var withDate = JSON.parse(localStorage.getItem("withDate"));
        task = findTaskInObj(withDate, id);
      }
      return task;
    };

    var saveToInbox = function(newTask, completed) {
      completed = completed || false;
      var inbox = JSON.parse(localStorage.getItem("inbox")) || [];
      inbox.unshift({name: newTask, createdOn: new Date().getTime(), completed: completed});
      localStorage.setItem("inbox", JSON.stringify(inbox));
    };

    var saveToWithDate = function(newTask, beginDateRaw, beginTimeRaw, endDateRaw, endTimeRaw, completed) {
      completed = completed || false;
      var withDate = JSON.parse(localStorage.getItem("withDate")) || {},
          beginDate = parseDate(new Date(beginDateRaw)),
          beginTime = parseTime(new Date(beginTimeRaw)),
          endDate = parseDate(new Date(endDateRaw)),
          endTime = parseTime(new Date(endTimeRaw));
      if(!withDate[beginDate]) {
        withDate[beginDate] = [];
      }
      withDate[beginDate].unshift({
        name: newTask,
        createdOn: new Date().getTime(),
        completed: completed,
        beginDate: beginDate,
        beginTime: beginTime,
        endDate: endDate,
        endTime: endTime});
      localStorage.setItem("withDate", JSON.stringify(withDate));
    };

    var deleteTaskById = function(id) {
      var index = -1,
          task = getTaskById(id);
      if(task.beginDate) {
        var withDate = JSON.parse(localStorage.getItem("withDate"));
        var arr = withDate[task.beginDate];
        arr.forEach(function(value, ind) {
          if(value.createdOn === id) {
            index = ind;
          }
        });
        if(index > -1){
          arr.splice(index, 1);
        }
        localStorage.setItem("withDate", JSON.stringify(withDate));
      } else {
        var inbox = JSON.parse(localStorage.getItem("inbox"));
        inbox.forEach(function(value, ind) {
          if(value.createdOn === id) {
            index = ind;
          }
        });
        if(index > -1){
          inbox.splice(index, 1);
        }
        localStorage.setItem("inbox", JSON.stringify(inbox));
      }
    };

    return {
      parseDate: parseDate,
      parseTime: parseTime,
      getUpcomingArr: getUpcomingArr,
      getTasks: getTasks,
      addSlash: addSlash,
      saveToInbox: saveToInbox,
      saveToWithDate: saveToWithDate,
      getTaskById: getTaskById,
      deleteTaskById: deleteTaskById
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
