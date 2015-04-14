Router.configure({
  layoutTemplate: 'main',
  notFoundTemplate: "not-found"
});


// Simple Routes where template name == route Name
Router.map(function() {
    this.route('splash', {
        path: '/'
    });
    this.route('about');
    this.route('dashboard');
});

// Helper Functions
var enforceLogin = function() {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {

        } else {
            this.render('splash');
        }
    } else {
        this.next();
    }
};

var showDashboard = function() {
    if (Meteor.user()) {
        this.render('dashboard');
    } else {
        this.next();
    }
}

Router.onBeforeAction(showDashboard, {only: 'splash'})
// Router.onBeforeAction(enforceLogin)
