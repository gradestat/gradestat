Session.setDefault("dashView", 'courses');

Template.dashboard.events({
    'click #home': function(e) {
	Session.set('dashView', 'home');
    },
    'click #settings': function(e) {
	Session.set('dashView', 'settings');
    },
    'click #courses': function(e) {
	Session.set('dashView', 'courses');
    }
});


Tracker.autorun(function() {
    Meteor.subscribe("userData");
});

Template.mycourses.helpers({
    noToken: function() {
	return Meteor.user().canvasToken == null || Meteor.user().canvasToken == "";
    },
    courses: function() {
	var courses = JSON.parse(Template.instance().courseInfo.get());
//	var teaching = courses.filter(function(el) {
//	    if (el.enrollments[0].type == "teacher" || el.enrollments[0].type == "ta") {
//		return el;
//	    }
//	});
//	return teaching;
	return courses;
//	var token =  Meteor.user().canvasToken;
//	Meteor.call('getCourses', token, function(error, response) {
//	    this.find("#courses").innerHTML = response.content;
//	});
//	return "Loading...";
    }
});

Template.dashboard.helpers({
    dashView: function() {
	return Session.get("dashView");
    },
    canvasToken: function() {
	var user = Meteor.user();
	return user.canvasToken;
    },
    userId: function() {
	return Meteor.userId();
    },
});

Template.mycourses.created = function() {
    var self = this;
    self.courseInfo = new ReactiveVar("[Loading...]");
    Meteor.call('getCourses', function(err, value) {
	if (err) {
	    console.log(err);
	} else {
	    self.courseInfo.set(value);
	}
    });
}
