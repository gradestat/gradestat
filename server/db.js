// DB Setup
// Users "collection" is created for us

// Courses
Courses = new Mongo.Collection('courses');

Assignments = new Mongo.Collection('assignments');
/****
Assignment Schema:
 {
    id: 'bcourses-id',
    // bcourses stuff
    readers_assignment: [ reader: { assignments: [] } ]
    cached_submissions: [ ]
    validatios: [ assignments]
 }
****/



// Course Configurations?
// Autograders -- Later
//
