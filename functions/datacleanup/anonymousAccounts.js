// const functions = require('firebase-functions')
// const admin = require('firebase-admin')

// exports.anonymousAccounts = functions.https.onRequest(async (req, res) => {
//   const allUsers = await admin.auth().getUsers()
//   allUsers.users.forEach((userRecord) => {
//     if (!userRecord.email) {
//       admin.auth().deleteUser(userRecord.uid)
//     }
//   })
// })
