var canvasBaseURL = "https://bcourses.berkeley.edu/api/v1";

function requestParams(query) {
    var baseQuery =  { 'per_page': '100' };
    // Stupidly simple $.extend()
    for (prop in query) {
        if (query.hasOwnProperty(prop)) { baseQuery[prop] = query[prop]; }
    }

    var options = {
        headers: {
            Authorization: 'Bearer ' + Meteor.user().canvasToken
        },
        query: baseQuery,
        npmRequestOptions: {
            json: true,
            useQueryString: true
        }
    }
    console.log(options);
    return options;

    //return "?per_page=100&access_token=" + ;
}

Meteor.methods({
    getCourses: function() {
        var result = Meteor.http.get(canvasBaseURL + "/courses", requestParams()).content;
        return result;
    },
    getAssignmentList: function(courseId) {
        var result = Meteor.http.get(canvasBaseURL + "/courses/" + courseId + "/assignments", requestParams()).content;
        return result;
    },
    getAssignment: function(courseId, assignmentId) {
        var result = Meteor.http.get(canvasBaseURL + "/courses/" + courseId + "/assignments/" + assignmentId, requestParams()).content;
        return result;
    }
    // getStaff: function(courseId, assignmentId) {
    //     var result = Meteor.http.get(canvasBaseURL + "/courses/" + courseId + "/assignments/" + assignmentId, requestParams()).content;
    //     return result;
    // }
});

// Serverside routes
Router.map(function() {
    this.route('update_token',
        function () {
            var user = Meteor.users.update({_id: this.request.query.user_id},
                    { $set: {"canvasToken": this.request.query.access_token} });
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
