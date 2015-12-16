/*
* Server-side, Home of >publish< stuff...
*/

Students = new Meteor.Collection('students');
Courses  = new Meteor.Collection('courses');
Grades   = new Meteor.Collection('studentscourses');
Historial= new Meteor.Collection('historial');
/* Record User Interaction for research purposes */
Recorder = new Meteor.Collection('recorder');

/***/

Meteor.publish('excellentgrades', function(who){
  return Grades.find({course: who, grade: { $gte : "16", $lte : "20" } }, {limit: 50});
});

Meteor.publish('verygoodgrades', function(who){
  return Grades.find({course: who, grade: { $gte : "15", $lt : "16" } }, {limit: 50});
});

Meteor.publish('goodgrades', function(who){
  return Grades.find({course: who, grade: { $gte : "13", $lte : "15" } }, {limit: 50});
});

Meteor.publish('sufficientgrades', function(who){
  return Grades.find({course: who, grade: { $gte : "10", $lte : "13" } }, {limit: 50});
});

Meteor.publish('failuregrades', function(who){
  return Grades.find({course: who, grade: { $gte : "1", $lte : "10" } }, {limit: 50});
});

/***/

Meteor.publish('studentgrades', function(who){
  return Grades.find({student: who});
});

Meteor.publish("this_student", function (who) {
  return Students.find({ "_id": who+""});
});

Meteor.publish("historial", function (who) {
  return Historial.find();
});

Meteor.publish("this_courses", function (who) {
  return Courses.find({"_id": {$in: who }});
});

SearchSource.defineSource('courses', function(searchText, options) {
  var options = {sort: {isoScore: -1}, limit: 5};
  if(searchText) {
    var regExp = buildRegExp(searchText+" ");
    var selector = {$or: [{name: regExp},{code: regExp}]};
    return Courses.find(selector, options).fetch();
  } else {
    return Courses.find({}, options).fetch();
  }
});

function buildRegExp(searchText) {
  var words = searchText.trim().split(/[ \-\:]+/);
  var exps = _.map(words, function(word) {
    return "(?=.*" + word + ")";
  });
  var fullExp = exps.join('') + ".+";
  return new RegExp(fullExp, "i");
}
