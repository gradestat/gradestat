Meteor.publish("userData", function() {
    return Meteor.users.find({}, {fields: {'canvasToken': 1}});
});