// Assignment Template

medianX = function(medianArr) {
    count = medianArr.length;
    median = (count % 2 == 0) ? (medianArr[(medianArr.length / 2) - 1] + medianArr[(medianArr.length / 2)]) / 2 : medianArr[Math.floor(medianArr.length / 2)];
    return median;
}

toggleBands = function(chart) {
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

average = function(data) {
    var sum = data.reduce(function(sum, value) {
        return sum + value;
    }, 0);
    var avg = sum / data.length;
    return avg;
}

setTimeData = function() {
    var data = Template.instance().readerSubmissionList.get();
    for (gId in data) {
	data[gId] = data[gId].map(function(e) {return new Date(e.graded_at);});
    }
    var assignment = Session.get("assignment");
    var lastDate = new Date(assignment.created_at);
    for (gId in data) {
	for (date in data[gId]) {
	    if (date > lastDate) {
		lastDate = date;
	    }
	}
    }
    var created = new Date(assignment.created_at);
    interval = (lastDate-created)/10
    cats = []
    for (var i=0; i < 10; i += 1) {
	cats.push(new Date((i*interval) + (created/1)));
    }
    duetime = assignment.due_at;
    sers = [];
    for (gId in data) {
	values = [];
	for (date in cats) {
	    subs = data[gId].filter(function(e) {return e <= date;}).length;
	    values.push(subs/data[gId].length);
	}
	sers.push({
	    name: gId,
	    data: values
	});
    }
    Session.set("timeData", {
        title: {
            text: 'Reader Progress',
            x: -20 //center
        },
        xAxis: {
            categories: cats
        },
        yAxis: {
            title: {
                text: 'Percent Complete (%)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '%'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: sers
    });
}

setHistoData = function(ret) {
    var all = $.grep(ret, function(o) {
        return o.grader_id == "All";
    });
    all = all[0];
    var mean = all.mean;
    var scores = all.scores;
    var squareDiffs = scores.map(function(value) {
        var diff = value - mean;
        var sqr = diff * diff;
        return sqr;
    });
    var sd = Math.sqrt(average(squareDiffs));
    Session.set("standardDeviation", sd);
    Session.set("mean", mean);
    Session.set("median", medianX(scores));
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
    var sigmas = [-3, -2, -1, 1, 2, 3];
    for (s in sigmas) {
        plotLines.push({
            "value": mean + sd * sigmas[s],
            "width": 1,
            "color": "#999",
            "dashStyle": "Dash",
            "zIndex": 10,
            "label": {
                "text": sigmas[s].toString() + "s",
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
        "from": -1 * sd + mean,
        "to": 1 * sd + mean,
        "color": "rgba(184,210,236,.1)",
        "zIndex": 0
    }, {
        "from": -2 * sd + mean,
        "to": 2 * sd + mean,
        "color": "rgba(184,210,236,.1)",
        "zIndex": 0
    }, {
        "from": -3 * sd + mean,
        "to": 3 * sd + mean,
        "color": "rgba(184,210,236,.1)",
        "zIndex": 0
    }];
    var maxPoints = Session.get("assignment").points_possible;
    var bucketSize = Math.ceil(maxPoints / 10);
    var bucketMargin = bucketSize / 2;
    var curBucket = bucketMargin;
    var buckets = [];
    var count = 0;
    while (curBucket < maxPoints) {
        count = 0;
        for (var i = 0; i < scores.length; i += 1) {
            if (scores[i] >= curBucket - bucketMargin && scores[i] < curBucket + bucketMargin) {
                count += 1;
            }
        }
        buckets.push([curBucket, count]);
        curBucket += bucketSize;
    }
    count = 0;
    for (var j = 0; j < scores.length; j += 1) {
        if (scores[j] == maxPoints) {
            count += 1;
        }
    }
    buckets[buckets.length - 1][1] += count;
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
            pointFormatter: function() {
                lower = this.x - bucketMargin;
                upper = this.x + bucketMargin;
                return '<b>Range:</b><br/> ' + lower + ' - ' + upper + '<br/>' +
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
                    legendItemClick: function(e) {
                        if (this.name == 'Sigma Bands') {
                            toggleBands(this.chart);
                        }
                    }
                }
            }
        },
        xAxis: {
            title: {
                text: 'Point Buckets'
            },
            lineColor: '#999',
            tickColor: '#ccc',
            plotLines: plotLines,
            plotBands: plotBands
        },
        yAxis: {
            title: {
                text: 'Count'
            },
            gridLineColor: '#e9e9e9',
            tickWidth: 1,
            tickLength: 3,
            tickColor: '#ccc',
            lineColor: '#ccc',
            endOnTick: false,
        },
        series: [{
            name: 'Submission Samples',
            data: buckets,
            pointRange: bucketSize,
            borderWidth: .5,
            borderColor: '#666',
            pointPadding: 0,
            groupPadding: 0,
            color: '#e3e3e3',
            tooltip: {
                pointFormatter: function() {
                    lower = this.x - bucketMargin;
                    upper = this.x + bucketMargin;
                    return '<b>Range:</b><br/> ' + lower + ' - ' + upper + '<br/>' + '<b>Count:</b> ' + this.y;
                }
            }
        }, {
            type: 'area',
            name: 'Sigma Bands',
        }]
    });
}

computeStats = function(values) {
    var ret = [0, 0, 0, 0, 0];
    values.sort(function(a, b) {
        return a - b;
    });
    q1Arr = (values.length % 2 == 0) ? values.slice(0, (values.length / 2) + 1) : values.slice(0, Math.floor(values.length / 2) + 1);
    q2Arr = values;
    q3Arr = (values.length % 2 == 0) ? values.slice((values.length / 2) - 1, values.length) : values.slice(Math.ceil(values.length / 2) - 1, values.length);
    medianX(q1Arr);
    ret[1] = median;
    medianX(q2Arr);
    ret[2] = median;
    medianX(q3Arr);
    ret[3] = median;
    ret[0] = values[0];
    ret[4] = values[values.length - 1];
    return ret;
}

setBoxData = function(ret) {
    Session.set("boxData", {
        chart: {
            type: 'boxplot',
            backgroundColor: 'white' //"#BBBBBB"
        },
        title: {
            text: 'Reader Grade Distributions'
        },
        legend: {
            enabled: false
        },
        xAxis: {
            categories: ret.map(function(x) {
                return x.grader_name;
            }),
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
            data: Session.get("ret").map(function(x) {
                return computeStats(x.scores);
            }),
            tooltip: {
                headerFormat: '<b>{point.key} Grades</b><br/>'
            }
        }, {
            name: 'Mean',
            color: Highcharts.getOptions().colors[0],
            type: 'scatter',
            data: ret.map(function(x) {
                return [ret.indexOf(x), x.scores.reduce(function(a, b) {
                    return a + b
                }, 0) / x.scores.length]
            }),
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
}

Template.assignment.created = function() {
    var self = this;
    self.submissionList = new ReactiveVar([]);
    Meteor.call("getSubmissions", Session.get("course").id, Session.get("assignment").id, function(err, value) {
        if (err) {
            console.log(err);
        } else {
            self.submissionList.set(value);
        }
    });
    
    self.mysubmissionList = new ReactiveVar([]);
    Meteor.call("mySubmissions", Session.get("assignment").id, function(err, value) {
        if (err) {
            console.log(err);
        } else {
            self.mysubmissionList.set(value);
        }
    });
    self.readerSubmissionList = new ReactiveVar([]);
    Meteor.call("assignedSubmissions", Session.get("course").id, Session.get("assignment").id, function(err, value) {
        if (err) {
            console.log(err);
        } else {
            self.readerSubmissionList.set(value);
        }
    });
}

Template.assignment.rendered = function() {
    $("#gradedata-toggle").click(function() {
        if ($("#gradeHistogram").contents().length != 0) {
            $("#gradeHistogram").html("");
        } else {
            $("#gradeHistogram").highcharts(Session.get("histoData"));
        }
    });
    $("#analytics-toggle").click(function() {
        if ($("#readerAverages").contents().length != 0) {
            $("#readerAverages").html("");
        } else {
            $("#readerAverages").highcharts(Session.get("boxData"));
        }
        if ($("#readerTimelines").contents().length != 0) {
            $("#readerTimelines").html("");
        } else {
            $("#readerTimelines").highcharts(Session.get("timeData"));
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
        return data;
    },
    mysubmissions: function() {
        var data = Template.instance().mysubmissionList.get();
        return data;
    },
    graderStats: function() {
        var data = Template.instance().submissionList.get();
        var total = 0;
        var count = 0;
        var stats = {};
        var gId = 0;
        for (var i = 0; i < data.length; i += 1) {
            gId = data[i].grader_id;
            total += data[i].score;
            count += 1;
            if (stats[gId]) {
                stats[gId].count += 1;
                stats[gId].total += data[i].score;
                stats[gId].scores.push(data[i].score);
            } else {
                stats[gId] = {
                    count: 1,
                    total: data[i].score,
                    scores: [data[i].score],
                    grader_name: data[i].grader_name
                };
            }
        }
        var ret = [];
        ret.push({
            grader_id: "All",
            mean: total / count,
            total: total,
            count: count,
            scores: data.map(function(x) {
                return x.score;
            }),
            grader_name: "All"
        });
        for (grader in stats) {
            stats[grader].mean = stats[grader].total / stats[grader].count;
            stats[grader].grader_id = grader;
            ret.push(stats[grader]);
        }
        Session.set("classMean", total / count);
        Session.set("ret", ret);
        setBoxData(ret);
        setTimeData();
	setHistoData(ret);
        return ret;
    },
    classMean: function() {
        return Session.get("classMean");
    },
    mean: function() {
        return Session.get("mean");
    },
    standardDeviation: function() {
        return Session.get("standardDeviation");
    },
    median: function() {
        return Session.get("standardDeviation");
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
    },
    'click #doAssignment': function(e) {
        var assnID = Session.get('assignment').id
        var courseID = Session.get('course').id
        var pctConstraint = $('.pctConstraint').val();
        var numConstraint = $('.numConstraint').val();
        var params = {
            course: courseID,
            assign: assnID,
            pct: parseFloat(pctConstraint),
            num: parseFloat(numConstraint)
        }
        $('.assignconf').html('<img src="/loading_spinner.gif" width="30px" height="30px"/>');
        Meteor.call('doReaderAssign', params, function(err, value) {
            if (err) {
                $('.assignconf').html(err);
            } else {
                $('.assignconf').html('<h4>Success!</h4>');
                Meteor.call("getSubmissions", Session.get("course").id, Session.get("assignment").id, function(err, value) {
                    if (err) {
                        console.log(err);
                    } else {
                        self.submissionList.set(value);
                    }
                });
            }
        });

    }
});
