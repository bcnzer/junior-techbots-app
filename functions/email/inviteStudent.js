const functions = require('firebase-functions')
const sendGridEmail = require('@sendgrid/mail')

const SENDGRID_API_KEY = functions.config().sendgrid.key
sendGridEmail.setApiKey(SENDGRID_API_KEY)

exports.inviteStudent = functions.firestore
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

exports.entryConfirmation = functions.firestore
  .document('submittedentries/{entryId}')
  .onCreate((event, context) => {
    const invite = event.data()
    const msg = {
      to: invite.email,
      from: 'Junior Techbots <noreply@juniortechbots.com>',
      subject: `We've received your request to join ${invite.clubName}`,
      templateId: 'd-dbca7ba9559a4618917ad80d8849ff3c',
      dynamic_template_data: {
        clubName: invite.clubName
      }
    }

    return sendGridEmail
      .send(msg)
      .then(() => console.log(invite.clubName))
      .catch((error) => console.error(error.toString()))
  })
