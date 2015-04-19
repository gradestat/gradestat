// DB Setup
// Users "collection" is created for us

// Courses
Courses = new Mongo.Collection('courses');

Assignments = new Mongo.Collection('assignments');

// Course Configurations?
// Autograders -- Later
//

/* Base URL for canvas/bCourses API requests. */
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
        params: baseQuery,
        npmRequestOptions: {
            json: true,
            useQueryString: true
        }
    }
    return options;
}

/* Check if an object in arr has value for field. */
function findObjectByField(arr, field, value) {
    for (var i = 0; i < arr.length; i += 1) {
        if (arr[i][field] == value) {
            return i;
        }
    }
    return -1;
}

function coursePath(id) {
    return canvasBaseURL + "/courses"+ (id ? "/" + id : '');
}

Meteor.methods({
    getCourses: function() {
        var result = Meteor.http.get(coursePath(),
                requestParams({'include[]':'term'})).content;
        //var myCourses = Courses.find({user_id: Meteor.userId()});
	var myCourseIds = Meteor.user().courses;
	console.log(myCourseIds);
	console.log(typeof( myCourseIds));
	if (myCourseIds != undefined && myCourseIds.length > 0) {
	    var myCourses = Courses.find({'id' : { $in : myCourseIds}});
            myCourses = myCourses.fetch();
            for (var i=0; i < myCourses.length; i += 1) {
		var index = findObjectByField(result, 'id', myCourses[i].id);
		if (index != -1) {
                    result[index] = myCourses[i];
		}
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
        console.log('STAFF SERVER CALLED');
        console.log(cId);
        var params = requestParams({'type[]': ['TaEnrollment', 'TeacherEnrollment'] });
        var call = Meteor.http.get(coursePath(cId) + "/enrollments", params);
        return call.contents || [];
    },
    addCourse: function(course) {
	var courseDB = Courses.find({'id': course.id});
	if (courseDB.fetch().length == 0) {
            Courses.insert(course);
	}
	Meteor.users.update({'_id':Meteor.userId()}, {$set: {'courses': Meteor.user().courses ? Meteor.user().courses.push(course.id) : [course.id]}});
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
