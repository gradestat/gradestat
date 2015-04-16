var canvasBaseURL = "https://canvas.instructure.com/api/v1";

function accessTokenString() {
    return "?access_token=" + Meteor.user().canvasToken;
}

Meteor.methods({
    getCourses: function() {
        console.log('Getting Courses....');
        console.log('TOKEN:');
        console.log(Meteor.user().canvasToken);
	var result = Meteor.http.get("https://bcourses.berkeley.edu/api/v1/courses?access_token=" + Meteor.user().canvasToken).content;
	return result;
    },
    getAssignmentList: function(courseId) {
	var result = Meteor.http.get(canvasBaseURL + "/courses/" + courseId + "/assignments" + accessTokenString()).content;
	return result;
    },
    getAssignment: function(courseId, assignmentId) {
	var result = Meteor.http.get(canvasBaseURL + "/courses/" + courseId + "/assignments/" + assignmentId + accessTokenString()).content;
	return result;
    }
});

// Serverside routes
Router.map(function() {
    this.route('update_token',
        function () {
            console.log('SETTING USER TOKEN:\n');
            console.log(this.request.query.access_token);
            console.log('UID:\n', this.request.query);
            var user = Meteor.users.update({_id: this.request.query.user_id},
                    { $set: {"canvasToken": this.request.query.access_token} });
            console.log(user);
            this.response.writeHead(200, {'Content-Type': 'text/html'});
            this.response.end("<h3>Loading...</h3><script>window.location.href='/dashboard'</script>");
        },
        { where: 'server' }
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
