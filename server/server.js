/* Base URL for canvas/bCourses API requests. */
var canvasBaseURL = "https://bcourses.berkeley.edu/api/v1";

function requestParams(p) {
    var baseQuery =  { 'per_page': '100' };
    var qs = _.extend({}, baseQuery, p);
    var options = {
        headers: {
            Authorization: 'Bearer ' + '19~ud3PyBoCaBRHVUCsvhPJEt285u8H2bX5Lw0gGnLU4zbKvOjgAxe2Qofjb9VDvCBy'
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
    getStaff: function(cId) {
        var course = Courses.findOne({"id": cId});
        if (!course) {
            return canvasStaff(cId);
        }
        return course.staff;
    },
    getSubmissions: function(cId, aId) {
        var data;
        // Check if the assignment has readers assigned:
        var assignment = Assignments.findOne({id: parseInt(aId) });
        if (assignment) {
            console.log('FOUND IN DB');
            data = assignment.cached_submissions;
            console.log(data);
        } else {
            var result = Meteor.http.get(coursePath(cId) + "/assignments/" + aId + "/submissions", requestParams({"include[]": "user"}));
            data = result.content;
        }

        var staff = canvasStaff(cId);
        for (var i = 0; i < data.length; i += 1) {
            grader = staff.filter(function(e) {return e.id == data[i].grader_id; });
            if (grader && grader[0] && grader[0].name) {
                data[i].grader_name = grader[0].name;
            }
        }
        return data;
    },
    setCanvasId: function(userId, token) {
        // FIXME -- url
        var canvasUser = Meteor.http.get(canvasBaseURL + "/users/self?access_token=" + token);
        canvasUser = JSON.parse(canvasUser.content);
        Meteor.users.update({_id: userId},
            { $set: {"canvasId": canvasUser["id"]} });
            console.log("Canvas id: " + canvasUser["id"])
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
            s.percent = null; // Not to be set directly (yet).
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
        var aId = params.assign;
        var cId = params.course
        var staff = Courses.findOne({ 'id' : parseInt(cId) });
        staff = staff.staff;
        if (!staff) {
            throw new Error('Course Staff Must be saved in GradeSate');
        }
        var assignment = Meteor.http.get(coursePath(cId) + "/assignments/" + aId, requestParams()).content;
        var submissions = Meteor.http.get(coursePath(cId) + "/assignments/" + aId + "/submissions", requestParams({"include[]": "user"}));
        submissions = submissions.content;
        staff = normalizeHours(staff); // Turn Hours to %
        // Assign to readers and return the validations assignments
        // Returns an object with TASKS, VALIDATIONS and SUBMISSIONMAP
        var tasks = assignReaders(staff, submissions, params.pct, params.num);

        // Store this in the DB since it's easy.
        assignment.submissions_map = tasks.submissionMap;
        assignment.cached_submissions = submissions;
        // Map Each Submission to the person it is assigned to:
        assignment.cached_submissions.forEach(function(subm) {
            var id = subm.id;
            if (tasks.submissionMap[id]) {
                subm.assigned_to_grade_id = tasks.submissionMap[id].id;
                subm.assigned_to_grade_name = tasks.submissionMap[id].name;
            } else {
                console.log('Uh oh! Assignment not found!!');
                console.log(subm);
            }
        })
        assignment.reader_taks = tasks.tasks;
        assignment.validations = tasks.validations;
        var existingAssignment = Assignments.findOne({'id': aId});
        if (existingAssignment) {
            Assignments.update({ 'id' : aId }, { $set: assignment });
        } else {
            Assignments.insert(assignment);
        }

        return true;
    }
});



function isCurrentCanvasUser(user) {
    return user.id == Meteor.user().canvasId;
}

function isNotCurrentCanvasUser(user) { return !isCurrentCanvasUser; }





//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

// This handles a very simple algorithm for reader assignment.
// Takes in Readers and a list of assignments.

// This is a helpful function to convert from a reader's hours to the percentage
// of work they need to do.
function normalizeHours(readers) {
    var total = 0;
    readers.forEach(function(r) { total += parseInt(r.hours) });
    readers.forEach(function(r) { r.percent = (r.hours / total) });
    return readers;
}

// Return a new array of readers where each reader has a list of assignments
// This are supposed to grade.
// Each reader is expected to have a `.workload` attribute which is their
// percentage of the work
// Validate determines the overlap in assignments to all readers, as a %
// maxValidate limits the percentage to a set value
function assignReaders(readers, submissions, validate, maxValidate) {
    var numAssignAll = calculateNumValidations(submissions.length, validate, maxValidate);
    // Make a copy of the readers adding an assignments array.
    var readerTaks = readers.map(function(r) {
        return _.extend({}, r, {assignments: [] });
    });
    var submissions = clone(submissions); // Immutability.
    // TODO: Update once assignment object exists.
    // Respresents assignments that need to be divided up by reader
    var numToAssign = submissions.length - numAssignAll;

    // Map Submission.id to reader.id for easy retrevial later.
    var submissionIDMap = {};
    // These assignments get assigned to every reader and stored separately.
    var validations = []
    var assignIdx = 0;
    while (numAssignAll) {
        submIdx = Math.floor(Math.random() * submissions.length);
        var subm = submissions[submIdx];submissions[submIdx];
        readerTaks.forEach(function(reader) {
            if (reader.hours && reader.percent) {
                reader.assignments.push(subm);
            }
        });
        validations.push(subm);
        submissionIDMap[subm.id] = {
            id: '1', // We need something that is truthy but not a valid id.
            name: 'Everyone'
        };
        submissions.splice(submIdx, 1); // remove item.
        numAssignAll--;
    }
    readerTaks.forEach(function(reader) {
        var readerNum = Math.round(reader.percent * numToAssign);
        while (readerNum) {
            submIdx = Math.floor(Math.random() * submissions.length);
            var subm = submissions[submIdx];
            // sometimes undefined is added to a reader array
            if (!subm) { break; }

            reader.assignments.push(subm);
            submissionIDMap[subm.id] = {
                id: reader.id, name: reader.name };
            submissions.splice(submIdx, 1); // remove item.
            readerNum--;
        }
    });
    // Cleanup remaining leftover assigments (rounding) if any.
    while (submissions.length) {
        readerTaks.some(function(reader) {
            reader.assingmnets.push(submissions.pop());
            // .some stops on true values, but we should stop only at 0.
            return !submissions.length;
        });
    }

    return { tasks: readerTaks,
             validations: validations,
             submissionMap: submissionIDMap };
}


function calculateNumValidations(numAsssignments, validPct, maxValid) {
    validPct = parseFloat(validPct);
    maxValid = parseInt(maxValid);
    var numAssignAll = 0;
    if (validPct > 1) { validPct /= 100; }

    numAssignAll = numAsssignments * validPct;
    numAssignAll = Math.min(numAssignAll, maxValid, numAsssignments);

    return Math.round(numAssignAll);
}


function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}