Tracker.autorun(function() {
    Meteor.subscribe("userData");
});

Template.dashboard.helpers({
    canvasToken: function() {
//	return Meteor.userId();	
	var user = Meteor.user();//.canvas_token;
	return user.canvasToken;
//	return Meteor.users.find({"canvasToken": {$exists:true,$ne:null}});
    },
    userId: function() {
	return Meteor.userId();
    }
});