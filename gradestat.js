Router.configure({
    layoutTemplate: "main",
});

Router.map(function() {
    this.route('about');
    this.route('dashboard');
});

Router.route('/', function() {
    if (Meteor.user()) {
        this.render('dashboard');
    } else {
        this.render('splash');
    }
})

