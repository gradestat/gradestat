// Serverside routes
Router.map(function() {
    this.route('update_token', {
	where: 'server',
	action: function () {
	    var user = Meteor.user();
	    user.canvas_token = this.request.query.access_token;
	},
    });
});


// DB Setup
// Users "collection" is created for us

// Courses
Courses = new Mongo.Collection('courses');

Assignments = new Mongo.Collection('assignments');

// Course Configurations?
// Autograders -- Later
//
