// Assignments Template

Template.assignment.helpers({
    assignment: function() {
	return Session.get("assignment");
    },
    course: function() {
	return Session.get("course");
    },
    boxChart: function() {
	return {
            chart: {
		plotBackgroundColor: null,
		plotBorderWidth: null,
		plotShadow: false
            },
            title: {
		text: "Reader Grade Distributions"
            },
            tooltip: {
		pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
		pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
			enabled: true,
			format: '<b>{point.name}</b>: {point.percentage:.1f} %',
			style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
			},
			connectorColor: 'silver'
                    }
		}
            },
            series: [{
		type: 'pie',
		name: 'genre',
		data: [
                    ['Adventure',   45.0],
                    ['Action',       26.8],
                    ['Ecchi',   12.8],
                    ['Comedy',    8.5],
                    ['Yuri',     6.2]
		]
            }]
	};
    }
});

Template.assignment.events({
    'click .course-link': function(e) {
	Session.set("dashView", "course");
    }
});
