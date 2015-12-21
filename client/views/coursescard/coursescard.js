/*
* Instant search (Global values for client, NOT part of this template life cycle)
*/
var fields = ['name'];
var options = {keepHistory: 1000,localSearch: true};
PackageSearch = new SearchSource('courses', fields, options);

/*
* Template life Cycle (Events)
*/
Template.semesterplan.events({
  "click .clear-search": function(event,template){
    template.$("#search-box").find("#input").val('');
  },
  "click .settings-icon, click .cc-nothing-add": function (event,template) {
    if(!template.$(".card-settings-icon").hasClass("opened")) {
      template.$(".card-settings-icon").addClass("opened");
      template.$(".card-content").animate({"min-width":"+=350px"},"slow", function(){
        template.$(".settings-content").css("display","flex");
        template.$(".card-settings-icon > iron-icon").fadeOut(200, function(){
          template.$(".card-settings-icon > iron-icon").attr("icon","icons:close").fadeIn(300);
        });
      });
    } else {
      template.$(".card-settings-icon").removeClass("opened");
      template.$(".settings-content").hide();
      template.$(".card-content").animate({"min-width":"-=350px"},"slow ", function(){
        template.$(".card-settings-icon > iron-icon").fadeOut(200, function(){
          template.$(".card-settings-icon > iron-icon").attr("icon","icons:create").fadeIn(300);
        });
      });
    }
  },
  "keyup #search-box, click #input": _.throttle(function(event,template) {
    template.$(".search-results").show();
    var text = $(event.target).val().trim();
    // var options = {courses: Session.get("courses")}
    PackageSearch.search(text);
  }, 200),
  "click": function(event,template){
    template.$(".search-results").hide();
    /*** Interaction Recorder ***/
    var self = this;
    var myEvent = event;
    if(Session.get("user-session")) {
      Actions.insert({
        "sessionId": Meteor.connection._lastSessionId,
        "user": Session.get("user-name"),
        "profile": Session.get("user-profile"),
        "prediction": Session.get("riskValue"),
        "uncertainty":Session.get("qualityValue"),
        "courses":Session.get("courses"),
        "load":Session.get("load"),
        "template": template.view.name,
        "target": $(event.target).first().attr('class'),
        "x": (event.pageX - $('.coursescard-paper').offset().left) + $(".content").scrollLeft(),
        "y": (event.pageY - $('.coursescard-paper').offset().top)  + $(".content").scrollTop(),
        "timestamp": new Date()
      });
    }
  },
  "mouseenter .result-course": function(event,template) {
    template.$("#cc-"+this._id).addClass("animated pulse");
    template.$("#cc-"+this._id).addClass("animated pulse");
    template.$("#cc-"+this._id).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      template.$("#cc-"+this._id).removeClass("animated pulse");
      template.$("#cc-"+this._id).removeClass("animated pulse");
    });
  },
  "mouseleave .result-course": function(event,template) {
    template.$("#cc-"+this._id).removeClass("animated pulse");
    template.$("#cc-"+this._id).removeClass("animated pulse");
  },
  "click .result-course": function(event,template) {
    var course = this;
    var courses = _.uniq(Session.get('courses'));
    if(courses.length < 7) {
      courses = _.extend([], courses);
      courses.push(course._id);
      courses = _.uniq(courses);
      Session.set("courses",courses);
      Session.set("loading",true);
      $(".risk-content-viz").css("opacity",0.5);
      $(".quality-content-viz").css("opacity",0.5);

      Meteor.subscribe("this_student", Session.get("student"), function() {
        Meteor.subscribe("this_courses", Session.get("courses"), function(){
          Meteor.subscribe("studentgrades", Session.get("student"), function() {
            Meteor.subscribe('sufficientgrades',course._id, function(){});
            Meteor.subscribe('failuregrades',   course._id, function(){});
            Meteor.subscribe('goodgrades',      course._id, function(){});
            Meteor.subscribe('verygoodgrades',  course._id, function(){});
            Meteor.subscribe('excellentgrades', course._id, function(){});
          });
        });
      });
      // var str = "";
      // if(courses) {
      //   for (var i=0; i<courses.length-1; i++) str += '{"id": "'+courses[i]+'", "compliance": 5},';
      //   str+= '{"id": "'+courses[courses.length-1]+'", "compliance": 5}';
      //   Websocket.send('{"requestId": "5645f7f7ef0bde57344c84de",'+
      //   '"student": [{"id": '+Session.get("student")+',"gpa": 7.0793,'+
      //   '"performance": 0.6,"compliance": 3}],'+
      //   '"courses": ['+ str + '],'+
      //   '"data": [{"from": 2009,"to": 2015,'+
      //   '"program": true,'+
      //   '"sylabus": true,'+
      //   '"evaluation": false,'+
      //   '"instructors": true,'+
      //   '"compliance": 2}]}');
      // }
      $(".settings-warning-message").fadeOut();
    } else {
      $(".settings-warning-message").fadeIn();
    }
  },
  "click .remove-selected-course": function(event,template) {
    var id = this._id;
    Session.set("loading",true);
    $(".settings-warning-message").fadeOut();
    $(".risk-content-viz").css("opacity",0.5);
    $(".quality-content-viz").css("opacity",0.5);
    $(event.target).parent().fadeOut('slow', function (){
      var courses = Session.get("courses");
      for(var i = courses.length; i--;) {
        if(courses[i] === id) {
          courses.splice(i, 1);
        }
      }
      Session.set("courses",courses);
      $(this).remove();

      var str = "";
      if(courses) {
        for (var i=0; i<courses.length-1; i++) str += '{"id": "'+courses[i]+'", "compliance": 5},';
        str+= '{"id": "'+courses[courses.length-1]+'", "compliance": 5}';
        Websocket.send('{"requestId": "5645f7f7ef0bde57344c84de",'+
        '"student": [{"id": '+Session.get("student")+',"gpa": 7.0793,'+
        '"performance": 0.6,"compliance": 3}],'+
        '"courses": ['+ str + '],'+
        '"data": [{"from": 2009,"to": 2015,'+
        '"program": true,'+
        '"sylabus": true,'+
        '"evaluation": false,'+
        '"instructors": true,'+
        '"compliance": 2}]}');
      }

    });
  },
  "click .cc-course": function(event,template) {
    var id = this._id;
    $(".gradescard-paper").find("circle").css("fill","#eceff1");
    $(".gradescard-paper").find("circle").css("fill-opacity","0.2");
    $(".gradescard-paper").find("circle").css("stroke","none");

    $("."+id+".sg-excellent").css("fill","#25a085");
    $("."+id+".sg-good").css("fill","#27ae60");
    $("."+id+".sg-regular").css("fill","#f0c30e");
    $("."+id+".sg-lazy").css("fill","#e67d22");
    // $("."+ id+".sg-bad").css("fill","#b25d7e");
    $(".sg-this").css("fill","#b25d7e");

    $("."+id+".sg-excellent").css("fill-opacity","1");
    $("."+id+".sg-good").css("fill-opacity","1");
    $("."+id+".sg-regular").css("fill-opacity","1");
    $("."+id+".sg-lazy").css("fill-opacity","1");
    // $("."+ id+".sg-bad").css("fill-opacity","1");
    $(".sg-this").css("fill-opacity","1");
    $("."+id).css("stroke","#ececec");

    /* background coloring */
    template.$(".cc-course").css("background","white");
    $(event.target).parents(".cc-course").css("background","#eceff1");
    if($(event.target).hasClass('cc-course')) $(event.target).css("background","#eceff1");
    /* set my session for globals */
    Session.set("selected-course",id);
  },
  "mouseenter .cc-course": function(event,template) {
    $(event.target).find(".cc-passed-legend").fadeIn();
  },
  "mouseleave .cc-course": function(event,template) {
    $(event.target).find(".cc-passed-legend").fadeOut();
  },
  "click .card-info": function (event,template) {
    template.$(".help-info").fadeIn();
  },
  "click .close-info": function (event,template) {
    template.$(".help-info").fadeOut();
  },
  "click .help-info": function (event,template) {
    template.$(".help-info").fadeOut();
  }
});

/*
* Display data from helpers
*/
Template.semesterplan.helpers({
  getCourses: function() {
    return PackageSearch.getData({
      transform: function(matchText, regExp) {
        // return matchText.replace(regExp, "<b>$&</b>")
        return matchText.toLowerCase();
      },
      sort: {isoScore: -1}
    });
  },
  isLoading: function() {
    return PackageSearch.getStatus().loading;
  },
  courses: function () {
    return Courses.find({});
  },
  hardCourses: function() {
    var courses = Session.get("courses");
    var sc;
    if (courses) {
      sc = Courses.find({"_id": {$in: courses }}).fetch();
      for (i = 0; i < sc.length; i++) {
        sc[i].name = sc[i].name.toLowerCase();
        sc[i].toph = Math.round((sc[i].passed*100)/sc[i].students);
        sc[i].both = Math.round(100 - sc[i].toph);
        sc[i].students = sc[i].students > 999 ? (sc[i].students/1000).toFixed(1) + 'k' : sc[i].students;
        sc[i].passed   = sc[i].passed > 999 ? (sc[i].passed/1000).toFixed(1) + 'k' : sc[i].passed;
      }
    }
    return sc;
  },
  sessionCourses: function() {
    var courses = Session.get("courses");
    var sc;
    if (courses) {
      sc = Courses.find({"_id": {$in: courses }}).fetch();
      for (i = 0; i < sc.length; i++) {
        sc[i].name = sc[i].name.toLowerCase();
        sc[i].students = sc[i].students > 999 ? (sc[i].students/1000).toFixed(1) + 'k' : sc[i].students;
        if(sc[i].difficulty <= 0.60) {
          sc[i].difficulty  = {color:"#e74c3c", text:"Hard", display:"none"};
        } else if(sc[i].difficulty > 0.60) {
          sc[i].difficulty  = {color:"#27ae60", text:"Easy", display:"flex"};
        }
      }
    }
    return sc;
  },
  compliance: function() {
    return Session.get("cc-compliance");
  },
  selectedCourse: function() {
    var x = Courses.findOne({ "_id" : Session.get("selected-course")});
    var y = false;
    if(x) {
      y = {
        "name": x.name,
        "id": x._id,
        "credits": x.credits,
        "passed": x.passed > 999 ? (x.passed/1000).toFixed(1) + 'k' : x.passed,
        "percent": Math.round((x.passed*100)/x.students)
      };
    }
    return y;
  },
  numberCourses: function() {
    var size = 0;
    var obj  = {number: size, text: "Courses"};
    if (Session.get("courses")) {
      size = Session.get("courses").length;
      obj  = {number: size, text: "Courses"};
      if(size == 1) obj = {number: size, text: "Course"};
    }
    return obj;
  },
  numberCredits: function() {
    var courses = Session.get("courses");
    var credits = 0;
    var bol = false;
    var color = "#939396";
    if (courses) {
      sc = Courses.find({"_id": {$in: courses }}).fetch();
      for (i = 0; i < sc.length; i++) {
        credits += parseInt(sc[i].credits);
      }
    }
    Session.set("load",credits);
    if (credits >= 30) {
      bol = true;
      color = "#e64c3c";
    }
    return {credits:credits, warning: bol, color: color};
  },
  loading: function() {
    return Session.get("loading");
  }
});
