Meteor.methods({
    getCourses: function() {
	var result = Meteor.http.get("https://bcourses.berkeley.edu/api/v1/courses?access_token=" + Meteor.user().canvasToken).content;
	return result;
    }
});

// Serverside routes
Router.map(function() {
    this.route(
	'update_token',
	function () {
	    var user = Meteor.users.update({_id: this.request.query.user_id}, {$set: {"canvasToken": this.request.query.access_token}});
	    this.response.writeHead(200, {'Content-Type': 'text/html'});
	    this.response.end("<h3>Loading...</h3><script>window.location.href='/dashboard'</script>");
	},
	{
	    where: 'server'
	}
    );
});


// DB Setup
// Users "collection" is created for us

// Courses
Courses = new Mongo.Collection('courses');

Assignments = new Mongo.Collection('assignments');

// Course Configurations?
// Autograders -- Later
//
