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
        var navBtnDisplay = $("#navBtn").css("display");
        if(navBtnDisplay === "none") {
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
