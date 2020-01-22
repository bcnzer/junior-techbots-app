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
    try {
      const originalLesson = change.before.data()
      const updatedLesson = change.after.data()
      const bucket = admin.storage().bucket()

      if (!change.after.exists) {
        // The document was deleted
        console.debug('The document was deleted so delete the thumbnail')
        await bucket.file(`screenshots/${originalLesson.id}`).delete()
      } else if (!originalLesson.url && !updatedLesson.url) {
        // It's still empty so do nothing
        console.debug('No changes to URL so doing nothing')
      } else if (originalLesson.url && !updatedLesson.url) {
        // User deleted the URL - deleting the image
        console.debug(`Deleting file ${originalLesson.url}`)
        await bucket.file(`screenshots/${originalLesson.id}`).delete()
        change.after.ref.set({ url_thumbnail: null }, { merge: true })
      } else if (!originalLesson.url && updatedLesson.url) {
        // User added a URL to an existing lesson, when previously there was none, so let's process it
        console.debug(`User added a different URL ${updatedLesson.url}`)
        await saveScreenshot(context.params.lessonId, updatedLesson.url)
      } else if (originalLesson.url !== updatedLesson.url) {
        // URL changed so delete the previous image and create a new one
        console.debug(
          `Deleting file ${originalLesson.url} and creating a new thumbnail`
        )
        await bucket.file(`screenshots/${originalLesson.id}`).delete()

        await saveScreenshot(context.params.lessonId, updatedLesson.url)
      }
    } catch (error) {
      console.error(error)
    }
  })

exports.takeScreenshotOnCreate = functions
  .runWith(runtimeOpts)
  .firestore.document('organizations/{organizationId}/lessons/{lessonId}')
  .onCreate(async function(event, context) {
    try {
      const lesson = event.data()
      if (lesson.url) {
        await saveScreenshot(lesson)
      }
    } catch (error) {
      console.error(error)
    }
  })

exports.takeScreenshotOnUpdate = functions
  .runWith(runtimeOpts)
  .firestore.document('organizations/{organizationId}/lessons/{lessonId}')
  .onUpdate(async function(change, context) {
    try {
      const originalLesson = change.before.data()
      const updatedLesson = change.after.data()
      const bucket = admin.storage().bucket()

      if (!originalLesson.url && !updatedLesson.url) {
        // It's still empty so do nothing
        console.debug('No changes to URL so doing nothing')
      } else if (originalLesson.url && !updatedLesson.url) {
        console.debug(`User deleted the URL - deleting the image`)
        console.debug(`Deleting file ${originalLesson.url}`)
        await bucket.file(`screenshots/${originalLesson.id}`).delete()
        change.after.ref.set({ url_thumbnail: null }, { merge: true })
      } else if (!originalLesson.url && updatedLesson.url) {
        console.debug(
          `User added a URL to an existing lesson, when previously there was none, so let's process it`
        )
        await saveScreenshot(context.params.lessonId, updatedLesson.url)
      } else if (originalLesson.url !== updatedLesson.url) {
        console.debug(
          `URL changed so delete the previous image and create a new one`
        )
        console.debug(`Deleting file ${originalLesson.url}`)
        await bucket.file(`screenshots/${originalLesson.id}`).delete()

        await saveScreenshot(context.params.lessonId, updatedLesson.url)
      }
    } catch (error) {
      console.error(error)
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
  console.debug(`Going to ${url}`)
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
  console.debug(`Creating file at ${filePath}`)
  const file = bucket.file(filePath)

  // Save the image
  console.debug(`Saving file`)
  await file.save(screenshot)

  return filePath
}
