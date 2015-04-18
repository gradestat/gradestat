// The Staff View Grabs All the Staff and lets you assign hours to them.

Template.staff_view.created = function() {
    var self = this;
    self.staffList = new ReactiveVar(['Loading...']);
    Meteor.call('getStaff', function(err, value) {
        if (err) {
            console.log(err);
        } else {
            self.staffList.set(value);
        }
    });
}

Template.staff_view.helpers({

});