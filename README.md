# GradeStat *Grade Better*
> An app that allows instructors to easily manage grading thousands of assignments and ensure they are graded accurately.

[View The live app][gs]

## Background
GradeStat was developed for [CS294-101][cs294], "Emerging Web Technology" with Professor Dawn Song in Spring 2015. The application was developed by Alec Guertin and Michael Ball.

For the class we wrote about our progress throughout the semester:

* [Proposal](http://webtech-cs294.tumblr.com/post/111183958936/proposal-GradeStat-by-lambda-lambda-lambda)
* [Milestone 1](http://webtech-cs294.tumblr.com/post/113788229828/GradeStat-project-milestone-1-team-lambda-lambda)
* [Milestone 2](http://webtech-cs294.tumblr.com/post/116986546335/project-milestone-2-GradeStat)
* [Milestone 3]() -- NOTE: Not yet published.

## Basic Features
GradeStat is an extension to an existing grade book type application. Currently, the chosen grade book interface bCourses at Berkeley. However, the app should work with any grade book future as long as there is an API that could be implemented.

Here's a summary of the headline features:

* Managing a course in GradeStat (basic DB access)
* Managing hours/week that course staff should work
* Automatically assigning readers to grade assignments
	* Allows for validation of assignments by assigning a set number of assignments to every reader.
* A histogram of grades for each assignment
* Tracking when readers complete grading
* Basic statistics by reader
	* Box and whisker histogram
	* Mean / Median / Mode / etc

## Technology and Code

GradeStat is built with [Meteor][meteor], which itself is built on nodeJS.

The client side code is fairly well organized by view where one `.html` and one `.js` correspond to each view component. However, pretty much all the server-side logic is contained in `server.js`. This is one place for future improvement. 

## Future Work
Please see the issue tracker for some bugs, as well as the proposal for where we think the application should go.

Here's some specific points of work that the app could use:

- [ ] Support for other Canvas installations besides bCourses. This fix should actually be relatively easy to complete.
- [ ] UI Cleanup. There's a lot of places where the UI could be refined. Furthermore,  we are currently using both PureCSS and Bootstrap, but there's no need for both. (It's also terribly bad for performance...)
- [ ] Performance and Caching. Making calls to a 3rd party service is expensive. We've implemented some decent amounts of caching on the backend, but the strategies and APIs are not consistent. This could definitely be cleaned up, as well as a better way to refresh data.
- [ ] Finding Students Based on Performance Metrics. We want easy ways to find out who's not doing well in a course. There will be Github issues for some specific issues, but this is one area to be inventive!
- [ ] Autograder Functionality. It would be nice to schedule and manage autograders for a particular assignment.
- [ ] Course level automation. Example: Can't we automatically automatically assignment readers based on the submission time?
- [ ] Email Alerts
- [ ] More Course interface APIs. Glookup would be an interesting example!
- [ ] Code Cleanup. This app could use a lot of refactoring and cleanup to be more maintainable and stable.

[gs]: https://GradeStat.meteor.com/
[cs294]: http://inst.eecs.berkeley.edu/~cs294-101/sp15/
[meteor]: http://meteor.com