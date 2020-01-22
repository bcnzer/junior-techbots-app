const sendGridEmail = require('@sendgrid/mail')
const admin = require('firebase-admin')
const functions = require('firebase-functions')

admin.initializeApp(functions.config().firebase)

const SENDGRID_API_KEY = functions.config().sendgrid.key

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

const runtimeOpts = {
  timeoutSeconds: 120,
  memory: '1GB'
}

exports.websiteScreenshots = functions
  .runWith(runtimeOpts)
  .firestore.document('organizations/{organizationId}/lessons/{lessonId}')
  .onWrite(async function(change, context) {
    const originalLesson = change.before.data()
    const updatedLesson = change.after.data()
    const bucket = admin.storage().bucket()

    if (change.before.exists && !change.after.exists) {
      // The whole document was deleted
      console.log('The document was deleted so delete the thumbnail')
      await bucket.file(`screenshots/${originalLesson.id}`).delete()
    } else if (!originalLesson.url && !updatedLesson.url) {
      // It's still empty so do nothing
      console.log('No changes to URL so doing nothing')
    } else if (originalLesson.url && !updatedLesson.url) {
      // User deleted the URL - deleting the image
      console.log(`Deleting file ${originalLesson.url}`)
      await bucket.file(`screenshots/${context.params.lessonId}.png`).delete()
      change.after.ref.set({ url_thumbnail: null }, { merge: true })
    } else if (!originalLesson.url && updatedLesson.url) {
      // User added a URL to an existing lesson, when previously there was none, so let's process it
      console.log(
        `User added a URL when one didn't exist previously ${updatedLesson.url}`
      )
      await saveScreenshot(context.params.lessonId, updatedLesson.url)
    } else if (originalLesson.url !== updatedLesson.url) {
      // URL changed so delete the previous image and create a new one
      console.log(
        `Deleting file ${originalLesson.url} and creating a new thumbnail`
      )
      await bucket.file(`screenshots/${context.params.lessonId}.png`).delete()

      await saveScreenshot(context.params.lessonId, updatedLesson.url)
    } else {
      console.log('Nothing happened')
    }
  })

const puppeteer = require('puppeteer')

// What we will do is save one screenshot per lesson. The ID of the file will
// be the {document ID}.png
async function saveScreenshot(id, url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  // Screenshot size
  await page.setViewport({ width: 1024, height: 576 })

  // Go to your website
  console.log(`Going to ${url}`)
  await page.goto(url)

  // Disable service workers
  await page._client.send('ServiceWorker.enable')
  await page._client.send('ServiceWorker.stopAllWorkers')

  // Take the screenshot
  const screenshot = await page.screenshot()

  await browser.close()

  const bucket = admin.storage().bucket()

  // Create a file object
  const filePath = `screenshots/${id}.png`
  console.log(`Creating file at ${filePath}`)
  const file = bucket.file(filePath)

  // Save the image
  console.log(`Saving file`)
  await file.save(screenshot)

  return filePath
}
