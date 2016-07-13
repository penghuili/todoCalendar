(function() {

  angular
    .module("todoCalendar")
    .service("utils", utils);

  function utils() {
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
    var amOrPm = function(hour) {
      if(hour > 12) {
        return [addZero(hour - 12), "PM"];
      }
      return [addZero(hour), "AM"];
    };

    var addZero = function(num) {
      if(num < 10) {
        return "0" + num.toString();
      }
      return num.toString();
    };

    return {
      parseDate: parseDate,
      parseTime: parseTime
    };
  }

})();
