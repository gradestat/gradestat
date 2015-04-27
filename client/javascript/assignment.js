// Assignment Template

toggleBands = function(chart) {
    console.log('index');

    var i = chart.xAxis[0].plotLinesAndBands.length;
    if (i > 0) {
        while (i--) {
            chart.xAxis[0].plotLinesAndBands[i].destroy();
        }
    } else {
        chart.xAxis[0].update({
            plotLines: plotLines,
            plotBands: plotBands
        });
    }

}

average = function(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);
 
  var avg = sum / data.length;
  return avg;
}

setHistoData = function(ret) {
    console.log("HISTODATA");
    var all = $.grep(ret, function(o) {return o.grader_id == "All";});
    all = all[0];
    var mean = all.mean;
    var scores = all.scores;
    var squareDiffs = scores.map(function(value){
	var diff = value - mean;
	var sqr = diff * diff;
	return sqr;
    });
    var sd = Math.sqrt(average(squareDiffs));
    var plotLines = [{
	"value": mean,
        "width": 2,
        "color": "#666",
        "zIndex": 10,
        "dashStyle": "Dash",
        "label": {
            "text": "m",
            "rotation": 0,
            "align": "center",
            "x": 0,
            "y": -5,
            "style": {
		"fontSize": "10px"
            }
	}
    }];
    var sigmas = [-3,-2,-1,1,2,3];
    for (s in sigmas) {
	plotLines.push({
	    "value": mean + sd*s,
            "width": 1,
            "color": "#999",
            "dashStyle": "Dash",
            "zIndex": 10,
            "label": {
		"text": s.toString() + "s",
		"rotation": 0,
		"align": "center",
		"x": 0,
		"y": -5,
		"style": {
		    "fontSize": "10px"
		}
	    }
	});
    }
    var plotBands = [{
	"from": -1*sd,
        "to": 1*sd,
        "color": "rgba(184,210,236,.1)",
        "zIndex": 0
    }, {
	"from": -2*sd,
        "to": 2*sd,
        "color": "rgba(184,210,236,.1)",
        "zIndex": 0
    }, {
	"from": -3*sd,
        "to": 3*sd,
        "color": "rgba(184,210,236,.1)",
        "zIndex": 0
    }];
    var maxPoints = Session.get("assignment").points_possible;
    var bucketSize = Math.ceil(maxPoints/10);
    var bucketMargin = bucketSize/2;
    var curBucket = bucketMargin;
    var buckets = [];
    var count = 0;
    console.log("SD: " + sd);
    while (curBucket < maxPoints) {
	count = 0;
	for (var i = 0; i < scores.length; i += 1) {
	    if (scores[i] > curBucket - bucketMargin && scores[i] < curBucket + bucketMargin) {
		count += 1;
	    }
	}
	buckets.push([curBucket, count]);
	curBucket += bucketMargin;
    }
    Session.set("histoData", {
	chart: {
            type: 'column',
            alignTicks: false,
            marginTop: 25,
            showAxes: true
	},
	exporting: {
            enabled: false
	},
	title: {
            text: 'Grade Histogram'
	},
	tooltip: {
            borderWidth: 1,
            formatter: function () {
		return '<b>Range:</b><br/> ' + this.x + '<br/>' +
                    '<b>Count:</b> ' + this.y;
            }
	},
	plotOptions: {
            series: {
		minPointLength: 1,
		shadow: false,
		marker: {
                    enabled: false
		}
            },
            area: {
		events: {
                    legendItemClick: function (e) {
			if (this.name == 'Sigma Bands') {
                            toggleBands(this.chart);
			}
                    }
		}
            }
	},
	xAxis: {
            lineColor: '#999',
            tickColor: '#ccc',
            plotLines: plotLines,
            plotBands: plotBands
	},
	yAxis: {
            title: {
		text: ''
            },
            gridLineColor: '#e9e9e9',
            tickWidth: 1,
            tickLength: 3,
            tickColor: '#ccc',
            lineColor: '#ccc',
            endOnTick: false,
	},
	series: [{
            name: 'Sample Distribution',
            data: buckets;
	    // [
	    // 	[-2.3138013781265, 1],
	    // 	[-2.0943590644815, 4],
	    // 	[-1.8749167508365, 11],
	    // 	[-1.6554744371915, 12],
	    // 	[-1.4360321235466, 18],
	    // 	[-1.2165898099016, 18],
	    // 	[-0.99714749625658, 24],
	    // 	[-0.77770518261159, 21],
	    // 	[-0.55826286896661, 36],
	    // 	[-0.33882055532162, 40],
	    // 	[-0.11937824167663, 51],
	    // 	[0.10006407196835, 40],
	    // 	[0.31950638561334, 42],
	    // 	[0.53894869925832, 36],
	    // 	[0.75839101290331, 40],
	    // 	[0.9778333265483, 36],
	    // 	[1.1972756401933, 23],
	    // 	[1.4167179538383, 18],
	    // 	[1.6361602674833, 9],
	    // 	[1.8556025811282, 12],
	    // 	[2.0750448947732, 3],
	    // 	[2.2944872084182, 4]
            // ],
            pointRange: 0.21944231364499,
            borderWidth: .5,
            borderColor: '#666',
            pointPadding: .015,
            groupPadding: 0,
            color: '#e3e3e3'
	}, {
            type: 'spline',
            lineWidth: 1,
            name: 'Normal Distribution',
            color: 'rgba(90,155,212,.75)',
            fillColor: 'rgba(90,155,212,.15)',
            data: [
		[-3.2807020192309, 0.10168053006185],
		[-3.0425988742109, 0.23641431548771],
		[-2.8044957291909, 0.51637633957668],
		[-2.5663925841709, 1.0595354537927],
		[-2.3282894391509, 2.0423080409267],
		[-2.0901862941309, 3.6981421093266],
		[-1.8520831491109, 6.2907516383431],
		[-1.6139800040909, 10.052592494842],
		[-1.3758768590709, 15.090728685704],
		[-1.1377737140509, 21.28133847858],
		[-0.89967056903087, 28.193192861774],
		[-0.66156742401087, 35.086995418605],
		[-0.42346427899086, 41.020853564556],
		[-0.18536113397085, 45.052593912695],
		[0.052742011049155, 46.482716760157],
		[0.29084515606916, 45.052593912695],
		[0.52894830108917, 41.020853564556],
		[0.76705144610918, 35.086995418605],
		[1.0051545911292, 28.193192861773],
		[1.2432577361492, 21.28133847858],
		[1.4813608811692, 15.090728685704],
		[1.7194640261892, 10.052592494842],
		[1.9575671712092, 6.2907516383431],
		[2.1956703162292, 3.6981421093266],
		[2.4337734612492, 2.0423080409267],
		[2.6718766062692, 1.0595354537927],
		[2.9099797512892, 0.51637633957668],
		[3.1480828963092, 0.23641431548771]
            ]
	}, {
            type: 'area',
            name: 'Sigma Bands',
	}]
    });
    $('#gradeHistogram').highcharts(Session.get("histoData"));
}

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
	    }
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
	setHistoData(ret);
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
