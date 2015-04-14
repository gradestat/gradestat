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
	return Template.instance().courseInfo.get();
//	var token =  Meteor.user().canvasToken;
//	Meteor.call('getCourses', token, function(error, response) {
//	    this.find("#courses").innerHTML = response.content;
//	});
//	return "Loading...";
    }
});

Template.dashboard.created = function() {
    var self = this;
    self.courseInfo = new ReactiveVar("Loading...");
    Meteor.call('getCourses', function(err, value) {
	if (err) {
	    console.log(err);
	} else {
	    self.courseInfo.set(value);
	}
    });
}
