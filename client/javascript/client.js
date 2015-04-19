// Session variable definitions
Session.setDefault("dashView", 'mycourses');
Session.setDefault("course", null);
Session.setDefault("assignmentList", null);
Session.setDefault("assignment", null);

// Subscribe to user info from DB
Tracker.autorun(function() {
    Meteor.subscribe("userData");
});
