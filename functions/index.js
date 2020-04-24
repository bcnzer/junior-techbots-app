const inviteStudent = require('./inviteStudent')
const screenshots = require('./screenshots')
const algolia = require('./algolia/onPublicLessonUpdate')

// More info on organizing functions https://firebase.google.com/docs/functions/organize-functions
exports.inviteStudentEmail = inviteStudent.inviteStudentEmail
exports.websiteScreenshots = screenshots.websiteScreenshots
exports.onPublicLessonUpdate = algolia.onPublicLessonUpdate
