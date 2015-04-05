Router.configure({
    layoutTemplate: "main",
});

Router.map(function() {
    this.route('splash', { path: '/' });
    this.route('about');
    this.route('dashboard');
});
