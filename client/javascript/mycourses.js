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
        Meteor.call('addCourse', this, function(err, value) {
            if (err) {
                console.log(err);
            } else {
                console.log("SUCCESS: added course " + value.name);
            }
        });
    },
    'click .remove-course': function(e) {
        Meteor.call('removeCourse', this, function(err, value) {
            if (err) {
                console.log(err);
            }
            if (value != 0) {
                e.removeClass('remove-course').addClass('add-course')
            }
        })
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
        for (var i = 0; i < courses.length; i += 1) {
            if (courses[i].bcourses) {
                courses[i] = courses[i].bcourses;
            }
        }
        return courses;
    },
    assignment: function() {
        return Session.get("assignment");
    }
});
