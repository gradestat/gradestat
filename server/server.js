/* Base URL for canvas/bCourses API requests. */
var canvasBaseURL = "https://bcourses.berkeley.edu/api/v1";

function requestParams(params) {
    var baseQuery =  { 'per_page': '100' };
    var qs = _.extend({}, baseQuery, params);
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

Meteor.methods({
    getCourses: function() {
        var result = Meteor.http.get(coursePath(),
                requestParams({'include[]':'term'})).content;
        var myCourseIds = Meteor.user().courses;
        if (myCourseIds) {
	    console.log(typeof myCourseIds);
            var myCourses = Courses.find({'id' : { $in : myCourseIds}});
            myCourses = myCourses.fetch();
            for (var i = 0; i < myCourses.length; i += 1) {
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
        var taParam = requestParams({enrollment_type:'ta',
                'include[]': ['email', 'avatar_url'] });
        var instParam = requestParams({enrollment_type:'teacher',
                'include[]': ['email', 'avatar_url'] });
        var tas = Meteor.http.get(coursePath(cId) + "/users", taParam);
        var inst = Meteor.http.get(coursePath(cId) + "/users", instParam);
        var all = [].concat(tas.content, inst.content)
        var sorted = all.sort(function(a, b) {
            a = a.sortable_name.toLowerCase();
            b = b.sortable_name.toLowerCase();
            if (a > b) { return 1; }
            if (a < b) { return -1; }
            return 0;
        });
        return sorted;
    },
    addCourse: function(course) {
        var courseDB = Courses.find({'id': course.id});
        if (courseDB.fetch().length == 0) {
            Courses.insert(course);
        }
        Meteor.users.update({'_id':Meteor.userId()}, {$addToSet: {'courses': course.id}});
        return course;
    }
});
