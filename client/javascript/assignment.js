// Assignment Template

Template.assignment.created = function() {
    var self = this;
    self.submissionList = new ReactiveVar([]);
    self.boxData = new ReactiveVar();
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
	console.log("DATA: " + data);
	var total = 0;
	var count = 0;
	var stats = {};
	var gId = 0;
	for (var i=0; i < data.length; i += 1) {
	    gId = data[i].grader_id;
	    total += data[i].score;
	    count += 1;
	    if (stats[gId]) {
		stats[gId].count += 1;
		stats[gId].total += data[i].score;
		stats[gId].scores.push(data[i].score);
	    } else {
		stats[gId] = {count: 1, total: data[i].score, scores: [data[i].score]};
	    }
	}
	var ret = [];
	ret.push({grader_id: "All", mean: total/count, total: total, count: count, scores: data.map(function(x) {return x.score;})});
	for (grader in stats) {
	    stats[grader].mean = stats[grader].total/stats[grader].count;
	    stats[grader].grader_id = grader;
	    ret.push(stats[grader]);
	}
	Session.set("classMean", total/count);
	Session.set("ret", ret);
	Session.set("boxData", {
	    chart: {
		type: 'boxplot',
		backgroundColor: "#BBBBBB"
	    },
	    title: {
		text: 'Reader Grade Distributions'
	    },
	    legend: {
		enabled: false
	    },
	    xAxis: {
		categories: ret.map(function(x) {return x.grader_id;}),
		title: {
		    text: 'Grader'
		}
	    },
	    yAxis: {
		title: {
		    text: 'Points Awarded'
		},
		plotLines: [{
		    value: Session.get("classMean"),
		    color: 'red',
		    width: 1,
		    label: {
			text: 'Assignment Mean: ' + Session.get("classMean"),
			align: 'center',
			style: {
			    color: 'gray'
			}
		    }
		}]
	    },
	    series: [{
		name: 'Submissions',
		data: [[1,2,3,4,5],[5,6,7,8,9]],//Session.get("ret").map(function(x) {return x.scores;}),
		// [
		//     [760, 801, 848, 895, 965],
		//     [733, 853, 939, 980, 1080],
		//     [714, 762, 817, 870, 918],
		//     [724, 802, 806, 871, 950],
		//     [834, 836, 864, 882, 910]
		// ],
		tooltip: {
		    headerFormat: '<em>Submission {point.key}</em><br/>'
		}
	    }]

	});
	$('#readerAverages').highcharts(Session.get("boxData"));
	return ret;
    },
    classMean: function() {
	return Session.get("classMean");
    },
    boxChart: function() {
	return Session.get("boxData");
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
