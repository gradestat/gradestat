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
    for (var i = 0; i < tas.length; i += 1) {
        tas[i].enrollment_type = "TA";
    }
    var inst = Meteor.http.get(coursePath(cId) + "/users", instParam);
    inst = inst.content;
    for (var i = 0; i < inst.length; i += 1) {
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
    courseInDB: function(cId) {
        cId = parseInt(cId);
        var data = Courses.find({ 'id' : cId }).fetch()
        return data !== [];
    },
    getCourses: function() {
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
                return result;
            }
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
    getStaff: function(cId) {
        var course = Courses.find({"id": cId}).fetch();
        if (course.length == 0) {
            return canvasStaff(cId);
        }
        return course[0].staff;
    },
    getSubmissions: function(cId, aId) {
        var result = Meteor.http.get(coursePath(cId) + "/assignments/" + aId + "/submissions", requestParams({"include[]": "user"}));
        result = result.content;
        var staff = canvasStaff(cId);
        for (var i = 0; i < result.length; i += 1) {
            grader = staff.filter(function(e) {return e.id == result[i].grader_id;})[0];
            result[i].grader_name = grader.name;
        }
        return result;
    },
    setCanvasId: function(userId, token) {
        var canvasUser = Meteor.http.get(canvasBaseURL + "/users/self?access_token=" + token);
        canvasUser = JSON.parse(canvasUser.content);
        Meteor.users.update({_id: userId},
            { $set: {"canvasId": canvasUser["id"]} });

        return Meteor.users.find({_id: userId}).canvasId;
    },
    removeCourse: function(course) {
        var remove = Courses.remove({'id': parseInt(course.id)});
        if (remove == 0) {
            console.log('oh shitttttt');
        }
        return remove;
    },
    addCourse: function(course) {
        course.staff = canvasStaff(course.id);
        course.staff.forEach(function(s) {
            s.hours = 0;
            s.percent = null; // Not used currently.
        });
        var courseDB = Courses.find({'id': course.id});
        if (courseDB.fetch().length == 0) {
            Courses.insert(course);
        }
        Meteor.users.update({ '_id': Meteor.userId() },
                            { $addToSet: { 'courses': course.id } });
        var course_staff = Courses.findOne({"id" : course.id});
        course_staff = course_staff.staff;
        var my_info = course_staff.filter(isCurrentCanvasUser);
        var other_info = course_staff.filter(isNotCurrentCanvasUser);
        console.log('MY INFO');
        console.log(my_info);
        if (my_info.length > 0) {
            my_info = my_info[0];

            my_info.user_id = Meteor.userId();
            other_info.push(my_info);
        }

        Courses.update({ 'id': course.id },
                       { $set: { 'staff': other_info } });
        return course;
    },
    updateStaffHours: function(cId, hours) {
        var course = Courses.findOne({'id': parseInt(cId )});
        var staff = course.staff;
        staff.forEach(function(s) {
            if (hours[s.id]) {
                s.hours =  hours[s.id];
            }
        });
        // UpdateDB
        Courses.update({ 'id': course.id },
               { $set: { 'staff': staff } });
       return true;
    },
    doReaderAssign: function(params) {
        /* params = {
            course: courseID,
            assign: assnID,
            pct: pctConstraint,
            num: numConstraint
        } */
        console.log(params);
        var staff = Courses.findOne({ 'id' : parseInt(params.course) });
        staff = staff.staff;
        if (!staff) {
            throw new Error('Course Staff Must be saved in GradeSate');
        }
        console.log(staff);

        return true;
    }
});



function isCurrentCanvasUser(user) {
    return user.id == Meteor.user().canvasId;
}

function isNotCurrentCanvasUser(user) { return !isCurrentCanvasUser; }