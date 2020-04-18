const functions = require('firebase-functions')
const sendGridEmail = require('@sendgrid/mail')

const SENDGRID_API_KEY = functions.config().sendgrid.key
sendGridEmail.setApiKey(SENDGRID_API_KEY)

exports.inviteStudentEmail = functions.firestore
  .document('students/{studentId}/invites/{inviteId}')
  .onCreate((event, context) => {
    const invite = event.data()
    const msg = {
      to: invite.email,
      from: 'Junior Techbots <noreply@juniortechbots.com>',
      subject: `You've been invited to ${invite.clubName}`,
      templateId: 'd-ce3cf6acb54549999cb13c7db296140c',
      dynamic_template_data: {
        clubName: invite.clubName,
        clubId: invite.clubId,
        studentId: invite.inviteId,
        domainUrl: invite.domainUrl
      }
    }

    return sendGridEmail
      .send(msg)
      .then(() => console.log(invite.clubName))
      .catch((error) => console.error(error.toString()))
  })
