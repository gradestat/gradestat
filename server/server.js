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
        query: baseQuery,
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
        console.log('Getting Courses....');
        console.log('TOKEN:');
        console.log(Meteor.user().canvasToken);
        var result = Meteor.http.get(coursePath(), requestParams({'include[]':'term' })).content;
	var jsresult = JSON.parse(result);
	myCourses = Courses.find({user_id: Meteor.userId()});
	myCourses = myCourses.fetch();
	for (var i=0; i < myCourses.length; i += 1) {
	    var index = findObjectByField(jsresult, 'id', myCourses[i].id);
	    if (index != -1) {
		jsresult[index] = myCourses[i];
	 	//jsresult.push(myCourses[i]);
	    }
	}
	console.log(jsresult);
	console.log(myCourses.length);
	return jsresult;
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
