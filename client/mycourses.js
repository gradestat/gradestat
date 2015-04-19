// MYCOURSES TEMPLATE

Template.mycourses.created = function() {
    var self = this;
    self.courseInfo = new ReactiveVar(['Loading...']);
    Meteor.call('getCourses', function(err, value) {
        if (err) {
            console.log(err);
        } else {
            self.courseInfo.set(value);
        }
    });
}

Template.mycourses.events({
    'click .course-link': function(e) {
        Session.set("course", this);
	Session.set("dashView", "course");
        Meteor.call('getAssignmentList', Session.get("course").id, function (err, value) {
            if (err) {
                console.log(err);
            } else {
                Session.set("assignmentList", value);
            }
        });
    },
    'click .add-course': function(e) {
    this.user_id = Meteor.userId();
    Meteor.call('addCourse', this, function(err,value) {
        if (err) {
            console.log(err);
        } else {
            console.log("SUCCESS: added course " + value.name);
        }
    });
    }
});

Template.mycourses.helpers({
    noToken: function() {
        return !Meteor.user().canvasToken;
    },
    course: function() {
        return Session.get("course");
    },
    courses: function() {
        var courses = Template.instance().courseInfo.get();
//	var teaching = courses.filter(function(el) {
//	    if (el.enrollments[0].type == "teacher" || el.enrollments[0].type == "ta") {
//		return el;
//	    }
//	});
//	return teaching;
    return courses;
    },
    assignment: function() {
        return Session.get("assignment");
    }
});
