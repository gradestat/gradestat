// Assignments Template

Template.assignment.created = function() {
    var self = this;
    self.submissionList = new ReactiveVar([]);
    Meteor.call("getSubmissions", Session.get("course").id, Session.get("assignment").id, function (err, value) {
	console.log(value);
	if (err) {
	    console.log(err);
	} else {
	    console.log(value);
	    self.submissionList.set(value);
	}
    });
}

Template.assignment.helpers({
    assignment: function() {
	return Session.get("assignment");
    },
    course: function() {
	return Session.get("course");
    },
    submissions: function() {
	var data = Template.instance().submissionList.get();
	console.log(data);
	console.log(typeof data);
	return data;
    },
    graderStats: function() {
	var data = Template.instance().submissionList.get();
	var stats = {};
	var gId = 0;
	for (var i=0; i < data.length; i += 1) {
	    gId = data[i].grader_id;
	    if (stats[gId]) {
		stats[gId].count += 1;
		stats[gId].total += data[i].score;
		stats[gId].scores.push(data[i].score);
	    } else {
		stats[gId] = {count: 1, total: data[i].score, scores: [data[i].score]};
	    }
	}
	var ret = [];
	for (grader in stats) {
	    stats[grader].mean = stats[grader].total/stats[grader].count;
	    stats[grader].grader_id = grader;
	    ret.push(stats[grader]);
	}
	Session.set("ret", ret);
	return ret;
    }
});

Template.assignment.events({
    'click .course-link': function(e) {
	Session.set("dashView", "course");
    },
    'click .grade-submission': function(e) {
	if (this.preview_url) {
	    Session.set("submissionURL", this.preview_url);
	} else {
	    Session.set("submissionURL", this.html_url);
	}	
	window.open(Session.get("submissionURL"), "_blank").focus();
    }
});
