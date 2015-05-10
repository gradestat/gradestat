// MYCOURSES TEMPLATE

Template.mycourses.created = function() {
    var self = this;
    self.courseInfo = new ReactiveVar(['Loading...']);
    Meteor.call('getCourses', function(err, value) {
        console.log('Got data from server');
        if (err) {
            console.log(err);
        } else {
            console.log(value);
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
        console.log('ADD', e);
        this.user_id = Meteor.userId();
        Meteor.call('addCourse', this, function(err, value) {
            if (err) {
                console.log(err);
            } else {
                $(e.target).removeClass('add-course').addClass('remove-course').html('Remove')
                console.log("SUCCESS: added course " + value.name);
            }
        });
    },
    'click .remove-course': function(e) {
        console.log('REMOVE', e);
        this.user_id = Meteor.userId();
        Meteor.call('removeCourse', this, function(err, value) {
            if (err) {
                console.log(err);
            }
            if (value != 0) {
                console.log('REMOVE GOOD');
                $(e.target).removeClass('remove-course').addClass('add-course').html('Add')
            }
        })
    }
});

Template.mycourses.helpers({
    noToken: function() {
        if (Meteor.user()) {
            return !Meteor.user().canvasToken;
        }
        return true;
    },
    course: function() {
        return Session.get("course");
    },
    courses: function() {
        console.log("1");
        console.log(Template.instance().courseInfo);
        var courses = Template.instance().courseInfo.get();
        console.log("2: " + courses);
        if (courses) {
            for (var i = 0; i < courses.length; i += 1) {
                console.log("3");
                if (courses[i].bcourses) {
                    console.log("5");
                    courses[i] = courses[i].bcourses;
                }
            }
            console.log("4");
            return courses;
        }
    },
    assignment: function() {
        return Session.get("assignment");
    }
});
