Tracker.autorun(function() {
    Meteor.subscribe("userData");
});

Template.dashboard.helpers({
    canvasToken: function() {
	var user = Meteor.user();
	return user.canvasToken;
    },
    userId: function() {
	return Meteor.userId();
    },
    courses: function() {
	var courses = JSON.parse(Template.instance().courseInfo.get());
	var teaching = courses.filter(function(el) {
	    if (el.enrollments[0].type == "teacher" || el.enrollments[0].type == "ta") {
		return el;
	    }
	});
	return teaching;
//	var token =  Meteor.user().canvasToken;
//	Meteor.call('getCourses', token, function(error, response) {
//	    this.find("#courses").innerHTML = response.content;
//	});
//	return "Loading...";
    }
});

Template.dashboard.created = function() {
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
