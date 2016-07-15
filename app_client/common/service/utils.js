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
