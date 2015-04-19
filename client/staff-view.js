// The Staff View Grabs All the Staff and lets you assign hours to them.

Template.course_staff.created = function() {
    var self = this;
    self.staffList = new ReactiveVar(['Loading...']);
    Meteor.call('getStaff', Session.get("course").id, function (err, value) {
        console.log('STAFF BE GET');
        if (err) {
            console.log(err);
        } else {
	    console.log(value);
            self.staffList.set(value);
        }
    });
}

Template.course_staff.helpers({
    staffList: function() {
        console.log('STAFF CALLED');
        var data = Template.instance().staffList.get();
        return data;
    }
});
