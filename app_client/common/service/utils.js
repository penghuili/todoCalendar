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
      return navBtnDisplay === "block";
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
