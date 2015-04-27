// Assignment Template

medianX = function(medianArr) {
    count = medianArr.length;
    median = (count % 2 == 0) ? (medianArr[(medianArr.length/2) - 1] + medianArr[(medianArr.length / 2)]) / 2:medianArr[Math.floor(medianArr.length / 2)];
    return median;
}

computeStats = function(values) {
    var ret = [0,0,0,0,0];
    values.sort(function(a,b) {return a-b;});
    q1Arr = (values.length % 2 == 0) ? values.slice(0, (values.length / 2) + 1) : values.slice(0, Math.floor(values.length / 2) + 1);
    q2Arr =  values;
    q3Arr = (values.length % 2 == 0) ? values.slice( (values.length/2) - 1, values.length) : values.slice(Math.ceil(values.length / 2) - 1, values.length);
    medianX(q1Arr);
    ret[1]=median;
    medianX(q2Arr);
    ret[2]=median;
    medianX(q3Arr);
    ret[3]=median;
    ret[0] = values[0];
    ret[4] = values[values.length-1];
    return ret;
}

setBoxData = function(ret) {
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
	    name: 'Grade Distribution',
	    data: Session.get("ret").map(function(x) {return computeStats(x.scores);}),
	    tooltip: {
		headerFormat: '<b>{point.key} Grades</b><br/>'
	    }
	}, {
	    name: 'Mean',
            color: Highcharts.getOptions().colors[0],
            type: 'scatter',
            data: ret.map(function(x) {return [ret.indexOf(x),x.scores.reduce(function(a,b){return a+b}, 0)/x.scores.length]}),
            marker: {
                fillColor: '#254A6E',
                lineWidth: 1,
                lineColor: Highcharts.getOptions().colors[0]
            },
            tooltip: {
                pointFormat: 'Value: {point.y}'
            }
	}]
    });
    $('#readerAverages').highcharts(Session.get("boxData"));
}

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
	setBoxData(ret);
	return ret;
    },
    classMean: function() {
	return Session.get("classMean");
    },
    boxChart: function() {
	return Session.get("boxData");
    },
    histoChart: function() {
	return Session.get("histoData");
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
