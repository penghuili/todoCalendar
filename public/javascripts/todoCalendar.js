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

    vm.prev = function() {
      vm.date = new Date(vm.date.setDate(vm.date.getDate() - 1));
      vm.changeDate();
      return false;
    };

    vm.next = function() {
      vm.date = new Date(vm.date.setDate(vm.date.getDate() + 1));
      vm.changeDate();
      return false;
    };

    vm.today = function() {
      vm.date = new Date();
      vm.changeDate();
      return false;
    };

    vm.addTask = function(task) {
      var width = $("#taskBox ul").width();
      if(utils.mobile()) {
        width = width * 0.85;
      } else {
        width = width * 0.93;
      }
      var top = vm.getTop(task.begin) + 1;
      var height = vm.getHeight(task.begin, task.end);
      var colorArr = vm.getRandomColor();
      var div = $("<div class=taskItem></div>").css({
        "width": width + "px",
        "height": height + "px",
        "line-height": height + "px",
        "border": "1px solid rgb(" + colorArr[0] + "," + colorArr[1] + "," + colorArr[2] + ")",
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
      return hour * 60 + 60 * minute / 60;
    };

    vm.getHeight = function(beginTimestamp, endTimestamp) {
      var beginTop = vm.getTop(beginTimestamp) + 1;
      var endTop = vm.getTop(endTimestamp) - 2;
      return endTop - beginTop;
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
    vm.checkedDevice = false;

    vm.init = function() {
      vm.inboxs = utils.getTasks("inbox");
      vm.todays = utils.getTasks("today");
      vm.completeds = utils.getTasks("completed");
      vm.alls = utils.getTasks("all");

      if(!vm.checkedDevice){
        if(!utils.mobile()) {
          $(".panel-collapse.collapse").addClass("in");
          $(".panel-heading a").attr("href", "#").hover(function() {
            $(this).css({"cursor": "default", "text-decoration": "none"});
          });
        } else {
          $("#todoList").css("height", "auto");
        }
        vm.checkedDevice = true;
      }
    };

    vm.change = function(box) {
      var checked;
      if(box === "inbox") {
        checked = vm.getCheckedTask(vm.inboxs, true);
        utils.updateTask(checked);
      } else if(box === "today") {
        checked = vm.getCheckedTask(vm.todays, true);
        utils.updateTask(checked);
      } else if(box === "all") {
        checked = vm.getCheckedTaskInAll(vm.alls);
        utils.updateTask(checked);
      } else if (box === "completed") {
        checked = vm.getCheckedTask(vm.completeds, false);
        utils.updateTask(checked);
      }
      vm.init();
    };

    vm.getCheckedTask = function (arr, completed) {
      return arr.filter(function(value) {
        return value.completed === completed;
      })[0];
    };

    vm.getCheckedTaskInAll = function(all) {
      var task, len = all.length;
      for(var i = 0; i < len; i++) {
        task = vm.getCheckedTask(all[i].tasks, true);
        if(task){
          return task;
        }
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
    vm.raw = {};
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

    var task = utils.getTaskById(vm.id);console.log(task);
    if(task){
      vm.newTask = task.name;
      vm.completed = task.completed;

      vm.raw.name = task.name;
      vm.raw.completed = task.completed;

      if(task.begin){
        vm.begin.dateRaw = new Date(task.begin);
        vm.begin.timeRaw = new Date(task.begin);
        vm.begin.date = utils.timestampToDateWithSlash(task.begin);
        vm.begin.time = utils.timestampToTimeWithAM(task.begin);

        vm.end.dateRaw = new Date(task.end);
        vm.end.timeRaw = new Date(task.end);
        vm.end.date = utils.timestampToDateWithSlash(task.end);
        vm.end.time = utils.timestampToTimeWithAM(task.end);

        vm.raw.beginDateRaw = new Date(task.begin);
        vm.raw.endDateRaw = new Date(task.end);
      }
    }

    vm.change = function() {
      if(vm.begin.dateRaw) {
        vm.begin.date = utils.timestampToDateWithSlash(vm.begin.dateRaw.getTime());
      }
      if(vm.begin.timeRaw) {
        vm.begin.time = utils.timestampToTimeWithAM(vm.begin.timeRaw.getTime());
      }
      if(vm.end.dateRaw) {
        vm.end.date = utils.timestampToDateWithSlash(vm.end.dateRaw.getTime());
      }
      if(vm.end.timeRaw) {
        vm.end.time = utils.timestampToTimeWithAM(vm.end.timeRaw.getTime());
      }
    };

    vm.changed = function() {
      return vm.raw.name !== vm.newTask ||
             vm.raw.completed !== vm.completed ||
             vm.raw.beginDateRaw !== vm.begin.dateRaw ||
             vm.raw.beginDateRaw !== vm.begin.timeRaw ||
             vm.raw.endDateRaw !== vm.end.dateRaw ||
             vm.raw.endDateRaw !== vm.end.timeRaw;
    };
    vm.onSubmit = function() {
      if(vm.changed()) {
        utils.deleteTaskById(vm.id);
        utils.saveNewTask(vm.newTask, vm.begin.dateRaw, vm.begin.timeRaw, vm.end.dateRaw, vm.end.timeRaw, vm.completed);
      }
      $location.path("/todo");
    };

    vm.delete = function() {
      var beginDate;
      if(vm.begin.dateRaw) {
        beginDate = utils.timestampToDateString(vm.begin.dateRaw.getTime());
      }
      utils.deleteTaskById(vm.id, beginDate);
      $location.path("/todo");
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
        vm.begin.date = utils.timestampToDateWithSlash(vm.begin.dateRaw.getTime());
      }
      if(vm.begin.timeRaw) {
        vm.begin.time = utils.timestampToTimeWithAM(vm.begin.timeRaw.getTime());
      }
      if(vm.end.dateRaw) {
        vm.end.date = utils.timestampToDateWithSlash(vm.end.dateRaw.getTime());
      }
      if(vm.end.timeRaw) {
        vm.end.time = utils.timestampToTimeWithAM(vm.end.timeRaw.getTime());
      }
    };

    vm.onSubmit = function() {
      utils.saveNewTask(vm.newTask, vm.begin.dateRaw, vm.begin.timeRaw, vm.end.dateRaw, vm.end.timeRaw);
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
      } else if (hour === 12) {
        return [12, "PM"];
      }
      return [addZero(hour), "AM"];
    };

    var dateAndTimeToTimestamp = function(date, time) {
      var hour = time.getHours(),
          minute = time.getMinutes(),
          day = date.getDate(),
          month = date.getMonth(),
          year = date.getFullYear(),
          timestamp = new Date(year, month, day, hour, minute).getTime();
      return timestamp;
    };

    var getDatabase = function() {
      return JSON.parse(localStorage.getItem("database")) || {};
    };

    var timestampToDateString = function(timestamp) {
      var date = new Date(timestamp),
          year = date.getFullYear().toString(),
          month = addZero(date.getMonth() + 1),
          day = addZero(date.getDate());
      return year + month + day;
    };


    //helper function end

    var timestampToDateWithSlash = function(timestamp) {
      var date = new Date(timestamp),
          year = date.getFullYear().toString(),
          month = addZero(date.getMonth() + 1),
          day = addZero(date.getDate());
      return month + "/" + day + "/" + year;
    };

    var timestampToTimeWithAM = function(timestamp) {
      var time = new Date(timestamp),
          hour = amOrPm(time.getHours()),
          minutes = addZero(time.getMinutes());
      return hour[0] + ":" + minutes + " " + hour[1];
    };


    var getTasks = function(where, dateString) {
      var sortArr = function(arr, where) {
        if(where === "inbox") {
          return arr.sort(function(a, b) {
            return b.createdOn - a.createdOn;
          });
        } else if(where === "today" || where === "all"){
          return arr.sort(function(a, b) {
            return a.begin - b.begin;
          });
        } else if (where === "completed") {
          return arr.sort(function(a, b) {
            return b.checkedOn - a.checkedOn;
          });
        } else {
          return arr;
        }
      };

      var getTasksFromArr = function(arr, completed, where) {
        var tmp = arr.filter(function (value) {
          return value.completed === completed;
        });
        return sortArr(tmp, where);
      };

      var getTasksFromObj = function(obj, completed) {
        var tasks = [];
        if(completed) {
          for(var date in obj) {
            tasks = tasks.concat(getTasksFromArr(obj[date], completed));
          }
          tasks = sortArr(tasks,"completed");
          return tasks;
        } else {
          var keys = Object.keys(obj),
              inboxIndex = keys.indexOf("inbox");
          if(inboxIndex > -1){
            keys.splice(inboxIndex, 1);
          }
          keys = keys.sort();
          var len = keys.length, index = 0, tmp;
          for(var i = 0; i < len; i++){
            tasks[index] = {};
            tasks[index].tasks = getTasksFromArr(obj[keys[i]], completed, "all");
            if(tasks[index].tasks.length > 0) {
              tasks[index].date = timestampToDateWithSlash(new Date(tasks[index].tasks[0].begin).getTime());
              index++;
            }
          }
          var tasksLen = tasks.length;
          if(len > 0 && tasks[tasksLen - 1].tasks.length < 1) {
            tasks.splice(tasksLen - 1, 1);
          }
          return tasks;
        }
      };

      var database = getDatabase();
      var tasks = [];
      if(where === "inbox") {
        var inbox = database.inbox || [];
        tasks = getTasksFromArr(inbox, false, "inbox");
      } else if (where === "today") {
        var todayString = timestampToDateString(new Date().getTime()),
            todayTasks = database[todayString] || [];
        tasks = getTasksFromArr(todayTasks, false, "today");
      } else if (where === "all") {
        tasks = getTasksFromObj(database, false);
      } else if (where === "completed") {
        tasks = getTasksFromObj(database, true);
      } else if (where === "someday"){
        tasks = database[dateString];
      } else {
        tasks = [];
      }
      return tasks;
    };

    var getTaskById = function(id, beginDate) {
      var task,
          database = getDatabase(),
          checkId = function(value) {
            return value.createdOn === id;
          };
      if(beginDate) {
        task = database[beginDate].filter(checkId)[0];
        if(task){return task;}
      } else {
        for(var date in database) {
          task = database[date].filter(checkId)[0];
          if(task){return task;}
        }
      }
      return null;
    };

    var saveNewTask = function(newTask, beginDateRaw, beginTimeRaw, endDateRaw, endTimeRaw, completed) {
      completed = completed || false;
      var database = getDatabase();
      if(newTask && (!beginDateRaw || !beginTimeRaw || !endDateRaw || !endTimeRaw)) {
        database.inbox = database.inbox || [];
        database.inbox.unshift({name: newTask, createdOn: new Date().getTime(), completed: completed});
      } else {
        var begin = dateAndTimeToTimestamp(new Date(beginDateRaw), new Date(beginTimeRaw)),
            end = dateAndTimeToTimestamp(new Date(endDateRaw), new Date(endTimeRaw)),
            beginDate = timestampToDateString(begin);

        database[beginDate] = database[beginDate] || [];
        database[beginDate].unshift({
          name: newTask,
          createdOn: new Date().getTime(),
          completed: completed,
          begin: begin,
          end: end});
        if(completed) {
          database[beginDate][0].checkedOn = new Date().getTime();
        }
      }
      localStorage.setItem("database", JSON.stringify(database));
    };

    var updateTask = function(task) {
      var database = getDatabase(),
          taskInDatabase;
      if(task.begin){
        var beginDate = timestampToDateString(task.begin);
        taskInDatabase = database[beginDate].filter(function(value) {
          return value.createdOn === task.createdOn;
        })[0];
      } else {
        taskInDatabase = database.inbox.filter(function(value) {
          return value.createdOn === task.createdOn;
        })[0];
      }
      taskInDatabase.completed = !taskInDatabase.completed;
      taskInDatabase.checkedOn = new Date().getTime();
      localStorage.setItem("database", JSON.stringify(database));
    };

    var deleteTaskById = function(id, beginDate) {
      var task,
          index,
          database = getDatabase(),
          checkId = function(value) {
            return value.createdOn === id;
          };
      if(beginDate) {
        task = database[beginDate].filter(checkId)[0];
        if(task){
          index = database[beginDate].indexOf(task);
          database[beginDate].splice(index, 1);
          localStorage.setItem("database", JSON.stringify(database));
          return task;
        }
      } else {
        for(var date in database) {
          task = database[date].filter(checkId)[0];
          if(task){
            index = database[date].indexOf(task);
            database[date].splice(index, 1);
            localStorage.setItem("database", JSON.stringify(database));
            return task;
          }
        }
      }
      return null;
    };


    var mobile = function () {
      var navBtnDisplay = $("#navBtn").css("display");
      return navBtnDisplay === "inline-block";
    };

    return {
      timestampToDateString: timestampToDateString,
      timestampToDateWithSlash: timestampToDateWithSlash,
      timestampToTimeWithAM: timestampToTimeWithAM,
      getDatabase: getDatabase,
      getTasks: getTasks,
      getTaskById: getTaskById,
      saveNewTask: saveNewTask,
      updateTask: updateTask,
      deleteTaskById: deleteTaskById,
      mobile: mobile
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

(function () {
  angular
    .module("todoCalendar")
    .controller("navigationCtrl", navigationCtrl);

  function navigationCtrl() {
    var vm = this;
    vm.hidePanelBody = function () {
      $(".navbar-toggle").click();
    };
  }
})();

(function() {
  angular
    .module("todoCalendar")
    .directive("navigation", navigation);

  function navigation() {
    return {
      templateUrl: "common/directive/navigation/navigation.view.html",
      controller: "navigationCtrl as navvm"
    };
  }
})();
