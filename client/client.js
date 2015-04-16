Session.setDefault("dashView", 'mycourses');
Session.setDefault("course", null);
Session.setDefault("assignmentList", null);
Session.setDefault("assignment", null);

Tracker.autorun(function() {
    Meteor.subscribe("userData");
});

// DASHBOARD TEMPLATE

Template.dashboard.events({
    'click #home': function(e) {
	Session.set('dashView', 'home');
    },
    'click #settings': function(e) {
	Session.set('dashView', 'settings');
    },
    'click #courses': function(e) {
	Session.set('dashView', 'mycourses');
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

// MYCOURSES TEMPLATE

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

Template.mycourses.events({
    'click .course-link': function(e) {
	Session.set("course", this);
	Meteor.call('getAssignmentList', Session.get("course").id, function (err, value) {
	    if (err) {
		console.log(err);
	    } else {
		Session.set("assignmentList", JSON.parse(value));
	    }
	});	
    },
    'click .assignment-link': function(e) {
	Session.set("assignment", this);
    }
});

Template.mycourses.helpers({
    noToken: function() {
	return Meteor.user().canvasToken == null || Meteor.user().canvasToken == "";
    },
    course: function() {
	return Session.get("course");
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
    },
    assignmentList: function() {
	return Session.get("assignmentList");
    },
    assignment: function() {
	return Session.get("assignment");
    }
});
