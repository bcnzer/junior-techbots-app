const functions = require('firebase-functions')

const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const SENDGRID_API_KEY = functions.config().sendgrid.key

const sendGridEmail = require('@sendgrid/mail')
sendGridEmail.setApiKey(SENDGRID_API_KEY)

exports.inviteStudentEmail = functions.firestore
  .document('students/{studentId}/invites/{inviteId}')
  .onCreate((event, context) => {
    const invite = event.data()
    const msg = {
      to: invite.email,
      from: 'Junior Techbots <noreply@juniortechbots.com>',
      subject: `You've been invited to ${invite.orgName}`,
      templateId: 'd-ce3cf6acb54549999cb13c7db296140c',
      dynamic_template_data: {
        orgName: invite.orgName,
        orgId: invite.orgId,
        studentId: invite.inviteId
      }
    }

    return sendGridEmail
      .send(msg)
      .then(() => console.log(invite.orgName))
      .catch((error) => console.error(error.toString()))
  })
