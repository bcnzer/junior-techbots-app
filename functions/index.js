const inviteStudent = require('./inviteStudent')
const screenshots = require('./screenshots')

// More info on organizing functions https://firebase.google.com/docs/functions/organize-functions
exports.inviteStudentEmail = inviteStudent.inviteStudentEmail
exports.websiteScreenshots = screenshots.websiteScreenshots
