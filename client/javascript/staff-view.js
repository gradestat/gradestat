// The Staff View Grabs All the Staff and lets you assign hours to them.

Template.course_staff.created = function() {
    var self = this;
    self.staffList = new ReactiveVar(['Loading...']);
    Meteor.call('getStaff', Session.get("course").id, function (err, value) {
        console.log(value);
        if (err) {
            console.log(err);
        } else {
            self.staffList.set(value);
        }
    });
    
    self.isInDB = new ReactiveVar(['Loading...']);
    Meteor.call('courseInDB', Session.get("course").id, function (err, value) {
        console.log(value);
        if (err) {
            console.log(err);
        } else {
            self.isInDB.set(value);
        }
    });
}

Template.course_staff.helpers({
    isInDB: function() {
        var data = Template.instance().isInDB.get();
        return data;
    },
    staffList: function() {
        var data = Template.instance().staffList.get();
        return data;
    }
});
