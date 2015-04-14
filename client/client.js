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
    }
});