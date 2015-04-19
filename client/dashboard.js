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
    course: function() {
	return Session.get("course");
    }
});
