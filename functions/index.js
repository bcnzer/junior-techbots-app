const sendGridEmail = require('@sendgrid/mail')
const admin = require('firebase-admin')
const functions = require('firebase-functions')

admin.initializeApp(functions.config().firebase)

const SENDGRID_API_KEY = functions.config().sendgrid.key

sendGridEmail.setApiKey(SENDGRID_API_KEY)

exports.updateLessonInClassSchedule = functions.firestore
  .document('organizations/{organizationId}/lessons/{lessonId}')
  .onWrite(async function(change, context) {
    const originalLesson = change.before.data()
    const updatedLesson = change.after.data()

    if (!originalLesson) {
      // Nothing to do here
      console.log('New lesson so ignore')
    } else if (!updatedLesson) {
      // TODO - how will I handle deletes? Maybe I won't and can just leave them alone
      console.log('Deleted lesson')
    } else {
      console.log('Updated lesson')
      const classesSnapshot = await admin
        .firestore()
        .collection('organizations')
        .doc(context.params.organizationId)
        .collection('classes')
        .get()
      classesSnapshot.forEach(async (doc) => {
        const currentClass = doc.data()
        if (currentClass.lessons) {
          for (let index = 0; index < currentClass.lessons.length; index++) {
            if (
              currentClass.lessons[index].lessonId === context.params.lessonId
            ) {
              console.log('found record to update')
              console.log('removing array item')
              await admin
                .firestore()
                .collection('organizations')
                .doc(context.params.organizationId)
                .collection('classes')
                .doc(doc.id)
                .update({
                  lessons: admin.firestore.FieldValue.arrayRemove(
                    currentClass.lessons[index]
                  )
                })

              console.log('adding array item')
              currentClass.lessons[index].name = updatedLesson.name
              currentClass.lessons[index].description =
                updatedLesson.description
              await admin
                .firestore()
                .collection('organizations')
                .doc(context.params.organizationId)
                .collection('classes')
                .doc(doc.id)
                .update({
                  lessons: admin.firestore.FieldValue.arrayUnion(
                    currentClass.lessons[index]
                  )
                })
            }
          }
        }
      })

      console.log(context.params.organizationId)
    }
  })

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

// NOTE - the docs to the Cloud Storage API https://googleapis.dev/nodejs/storage/latest/File.html#exists
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
      const fileToDelete = bucket.file(
        `lessons/${originalLesson.id}/screenshot.png`
      )

      const info = await fileToDelete.exists()
      if (info.exists) {
        fileToDelete.delete()
      }
    } else if (!originalLesson.url && !updatedLesson.url) {
      // It's still empty so do nothing
      console.log('No changes to URL so doing nothing')
    } else if (originalLesson.url && !updatedLesson.url) {
      // User deleted the URL - deleting the image
      console.log(`Deleting file ${originalLesson.url}`)

      const fileToDelete = bucket.file(
        `lessons/${context.params.lessonId}/screenshot.png`
      )
      const info = await fileToDelete.exists()
      if (info.exists) {
        fileToDelete.delete()
      }
      change.after.ref.set({ url_thumbnail: null }, { merge: true })
    } else if (!originalLesson.url && updatedLesson.url) {
      // User added a URL to an existing lesson, when previously there was none, so let's process it
      console.log(
        `User added a URL when one didn't exist previously ${updatedLesson.url}`
      )
      await saveScreenshot(context.params.lessonId, updatedLesson.url)
    } else if (originalLesson.url !== updatedLesson.url) {
      // URL changed so delete the previous image and create a new one
      const fileToDelete = bucket.file(
        `lessons/${context.params.lessonId}/screenshot.png`
      )
      const info = await fileToDelete.exists()
      if (info.exists) {
        console.log(
          `Deleting file ${originalLesson.url} and creating a new thumbnail`
        )

        fileToDelete.delete()
      }

      console.log('Saving screenshot')
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
  await page.setViewport({ width: 1024, height: 768 })

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
  const filePath = `lessons/${id}/screenshot.png`
  console.log(`Creating file at ${filePath}`)
  const file = bucket.file(filePath)

  // Save the image
  console.log(`Saving file`)
  const metadata = {
    contentType: 'image/png'
  }
  await file.save(screenshot, metadata)

  return filePath
}
