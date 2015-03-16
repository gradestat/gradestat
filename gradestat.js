Router.configure({
    layoutTemplate: "layout",
});

Router.map(function() {
    this.route('splash', {path: '/'});
    this.route('about');
    this.route('dashboard');
});
