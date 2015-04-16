var adapters = {
    bCourses: {
        name: "Canvas LMS (bCourses)",
        adapter: bcourses
    }
}

// Each adapter has a set of configurations
// This can be used for getting what's needed for a view page or DB queries
var bcourses = {
    course: {
        url: {
            descrption: 'This is the URL for the canvas instance',
            validation: function(inp) {
                // if desired use a function to validate input.
                // Can be run both on the client and server to be
                // secure and responsive.
                return inp.match(/\/\//) != null;
            }
        },
        id: {
            descrption: '',
            validation: /a/i, // Shortcut for a validation function
        },
        token: '',//user.token // not sure how this should work...
    },
    assignment: {
        id: {

        }
    },
    user: {
        token: {

        },
        id: {

        }
    }
}