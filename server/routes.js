// Serverside routes
Router.map(function() {
    this.route('update_token',
        function () {
            var user = Meteor.users.update({_id: this.request.query.user_id},
                    { $set: {"canvasToken": this.request.query.access_token} });
            this.response.writeHead(200, {'Content-Type': 'text/html'});
            this.response.end("<h3>Loading...</h3><script>window.location.href='/dashboard'</script>");
            Meteor.call("setCanvasId",
            this.request.query.user_id,
            this.request.query.access_token,
            function(err, value) {
                if (err) {
                    console.log("Arrrrghghghghgh: " + err);
                } else {
                    console.log("Yessssssssssssssssssss: " + value);
                }
            });
        },
        { where: 'server' }
    );
});
