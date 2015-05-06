// Courses Template

Template.course.events({
    'click .assignment-link': function(e) {
        Session.set("assignment", this);
        Session.set("dashView", "assignment");
    }
});

Template.course.helpers({
    assignmentList: function() {
        return Session.get("assignmentList");
    },
    course: function() {
        return Session.get("course");
    },
    myRole: function() {
        var role = Session.get("course");
        role = role.enrollments[0].type;
        return role == "teacher" ? "Instructor" : "TA";
    }
});
