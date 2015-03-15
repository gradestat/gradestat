Router.configure({
    layoutTemplate: "layout",
    notFoundTemplate: "not-found",
});

Router.map(function() {
    this.route('splash', {path: '/'});
    this.route('about');
});
