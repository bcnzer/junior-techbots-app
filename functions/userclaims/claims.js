const functions = require('firebase-functions')
const admin = require('firebase-admin')

exports.updateTeacherClaims = functions.firestore
  .document('teachers/{teacherId}')
  .onWrite(async (change, context) => {
    const teacher = change.data()
    if (change.before.exists && !change.after.exists) {
      // The whole document was deleted
      const deletedTeacher = change.before.data()

      await admin
        .firestore()
        .collection('teachers')
        .doc(teacher.teacherId)
        .delete()

      console.log(
        `Deleted UID ${deletedTeacher.uid} - ID ${context.params.teacherId}`
      )
    } else {
      // Newly added or updated document
      const currentTeacher = change.after.data()

      await admin
        .firestore()
        .collection('teachers')
        .doc(currentTeacher.id)
        .set({
          inClubAsStudent: firebase.firestore.FieldValue.arrayRemove(
            currentTeacher.uid
          )
        })
    }
  })
