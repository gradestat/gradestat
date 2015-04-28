/* Base URL for canvas/bCourses API requests. */
var canvasBaseURL = "https://bcourses.berkeley.edu/api/v1";

function requestParams(p) {
    var baseQuery =  { 'per_page': '100' };
    var qs = _.extend({}, baseQuery, p);
    var options = {
        headers: {
            Authorization: 'Bearer ' + Meteor.user().canvasToken
        },
        params: qs,
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

function canvasStaff(cId) {
    var taParam = requestParams({enrollment_type:'ta',
                    'include[]': ['email', 'avatar_url'] });
    var instParam = requestParams({enrollment_type:'teacher',
                    'include[]': ['email', 'avatar_url'] });
    var tas = Meteor.http.get(coursePath(cId) + "/users", taParam);
    tas = tas.content;
    for (var i=0; i < tas.length; i += 1) {
        tas[i].enrollment_type = "TA";
    }
    var inst = Meteor.http.get(coursePath(cId) + "/users", instParam);
    inst = inst.content;
    for (var i=0; i < inst.length; i += 1) {
        inst[i].enrollment_type = "Instructor";
    }
    var all = [].concat(tas, inst)
    var sorted = all.sort(function(a, b) {
        a = a.sortable_name.toLowerCase();
        b = b.sortable_name.toLowerCase();
        if (a > b) { return 1; }
        if (a < b) { return -1; }
        return 0;
    });
    return sorted;
}

Meteor.methods({
    getCourses: function() {
	console.log("AHAHAHAH");
	if (Meteor.user().canvasToken) {
            var result = Meteor.http.get(coursePath(),
					 requestParams({'include[]':'term'})).content;
            var myCourseIds = Meteor.user().courses;
            if (myCourseIds) {
		var myCourses = Courses.find({'id' : { $in : myCourseIds }});
		myCourses = myCourses.fetch();
		for (var i = 0; i < myCourses.length; i += 1) {
                    var index = findObjectByField(result, 'id', myCourses[i].id);
                    if (index != -1) {
			result[index] = myCourses[i];
                    }
		}
            }
            return result;
	}
	return null;
    },
    getAssignmentList: function(cId) {
        var result = Meteor.http.get(coursePath(cId) + "/assignments", requestParams()).content;
        return result;
    },
    getAssignment: function(cId, assignmentId) {
        var result = Meteor.http.get(coursePath(cId) + "/assignments/" + assignmentId, requestParams()).content;
        return result;
    },
    getStaff: canvasStaff,
    getSubmissions: function(cId, aId) {
        var result = Meteor.http.get(coursePath(cId) + "/assignments/" + aId + "/submissions", requestParams({"include[]": "user"}));
        return result.content;
    },
    addCourse: function(course) {
        console.log('ADDING COURSE');
        console.log(course);
        
        var course = {
            id: course.id,
            bcourses: course,
            staff: []
        };
        var courseDB = Courses.find({'id': course.id});
        if (courseDB.fetch().length == 0) {
            Courses.insert(course);
        }
        Meteor.users.update({ '_id':Meteor.userId() },
                            { $addToSet: { 'courses': course.id } });
        return course;
    }
});
