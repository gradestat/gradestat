// DB Setup
// Users "collection" is created for us

// Courses
Courses = new Mongo.Collection('courses');

Assignments = new Mongo.Collection('assignments');

// Course Configurations?
// Autograders -- Later
//

var canvasBaseURL = "https://bcourses.berkeley.edu/api/v1";

function requestParams(query) {
    var baseQuery =  { 'per_page': '100' };

    for (prop in query) { // Stupidly simple $.extend()
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
    return options;
}

function coursePath(id) {
    return canvasBaseURL + "/courses"+ (id ? "/" + id : '');
}

function findObjectByField(arr, field, value) {
    for (var i = 0; i < arr.length; i += 1) {
        if (arr[i][field] == value) {
            return true;
        }
    }
    return false;
}

Meteor.methods({
    getCourses: function() {
        var result = Meteor.http.get(coursePath(),
        var myCourses = Courses.find({user_id: Meteor.userId()});
        myCourses = myCourses.fetch();
        for (var i=0; i < myCourses.length; i += 1) {
            if (findObjectByField(result, 'id', myCourses[i].id)) {
                result.push(myCourses[i]);
            }
        }
        return result;
    },
    getAssignmentList: function(cId) {
        var result = Meteor.http.get(coursePath(cId) + "/assignments", requestParams()).content;
        return result;
    },
    getAssignment: function(cId, assignmentId) {
        var result = Meteor.http.get(coursePath(cId) + "/assignments/" + assignmentId, requestParams()).content;
        return result;
    },
    getStaff: function(cId) {
        var result = Meteor.http.get(coursePath(cId) + "/enrollments",
            requestParams({'type[]': ['TaEnrollment', 'TeacherEnrollment']})).content;
        return result;
    },
    addCourse: function(course) {
        Courses.insert(course);
        return course;
    }
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
