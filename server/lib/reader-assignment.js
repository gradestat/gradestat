// This handles a very simple algorithm for reader assignment.
// Takes in Readers and a list of assignments.

// This is a helpful function to convert from a reader's hours to the percentage
// of work they need to do.
function normalizeHours(readers) {
    var totalHours = 0;
    readers.forEach(function(r) { totaHours += r.hours });
    return readers.map(function(r) { return r.workload = (r.hours / totalHours) });
}

// Return a new array of readers where each reader has a list of assignments
// This are supposed to grade.
// Each reader is expected to have a `.workload` attribute which is their
// percentage of the work
// Validate determines the overlap in assignments to all readers.
// If validate >0 and < 1, then it is a percentage of the total number of
// assignments, otherwise, it is treated as an integer.
function assignReaders(readers, assignments, validate) {
    var numAssignAll = calculateNumValidations(assignments.length, validate);
    var readerTaks = readers.map(function(r) {
        return { name: r.name, id: r.id, workload: r.workload, assigments: [] };
    });
    var assigments = clone(assigments); // Immutability.
    // TODO: Update once assignment object exists.
    // Respresents assignments that need to be divided up by reader
    var numToAssign = assignments.length - numAssignAll;

    var assignIdx = 0;
    while (numAssignAll) {
        assignIdx = Math.floor(Math.random() * assignments.length);
        readerTaks.forEach(function(reader) {
            reader.assignments.push(assignments[assignIdx]);
        });
        assignments.splice(assignIdx, 1); // remove item.
        numAssignAll--;
    }
    readerTaks.forEach(function(reader) {
        var readerNum = Math.round(reader.workload * numToAssign);
        while (readerNum) {
            assignIdx = Math.floor(Math.random() * assignments.length);
            reader.assignments.push(assignments[assignIdx]);
            assignments.splice(assignIdx, 1); // remove item.
            readerNum--;
        }
    });
    // Cleanup remaining leftover assigments (rounding) if any.
    while (assingmnets.length) {
        readerTaks.some(function(reader) {
            reader.assingmnets.push(assingmnets.pop());
            // .some stops on true values, but we should stop only at 0.
            return !assingmnets.length;
        });
    }

    return readerTaks;
}


function calculateNumValidations(numAsssignments, toValidate) {
    var numAssignAll = 0;
    if (toValidate < 0) {
        numAssignAll = 0;
    } else if (toValidate < 1) {
        numAssignAll = numAsssignments * toValidate;
    } else {
        numAssignAll = Math.max(toValidate, numAsssignments);
    }
    return Math.round(numAssignAll);
}


function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}