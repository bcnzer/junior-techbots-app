const functions = require('firebase-functions')
const admin = require('firebase-admin')

exports.deleteStudent = functions.firestore
  .document('submittedentries/{entryId}')
  .onDelete(async function(event, context) {
    const entry = event.data()

    const result = await admin
      .firestore()
      .collection('students')
      .doc(entry.studentId)
      .get()

    const student = result.data()
    if (student.clubs.length > 0) {
      return 'Student record will not be deleted - is part of other clubs'
    }

    await admin
      .firestore()
      .collection('students')
      .doc(entry.studentId)
      .delete()

    return `Deleted student '${entry.displayName}'`
  })
