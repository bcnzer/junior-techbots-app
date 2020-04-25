// NOTE - the docs to the Cloud Storage API https://googleapis.dev/nodejs/storage/latest/File.html#exists
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

const puppeteer = require('puppeteer')

const runtimeOpts = {
  timeoutSeconds: 120,
  memory: '1GB'
}

/**
 * Capture screenshots user created lessons
 */
exports.userLesson = functions
  .runWith(runtimeOpts)
  .firestore.document('clubs/{clubId}/lessons/{lessonId}')
  .onWrite(async function(change, context) {
    await startScreenshot(change, context, 'lesson')
  })

/**
 * Capture screenshots for public lessons, that are globally accessible
 */
exports.libraryLesson = functions
  .runWith(runtimeOpts)
  .firestore.document('publiclessons/{lessonId}')
  .onWrite(async function(change, context) {
    await startScreenshot(change, context, 'public lesson')
  })

/**
 * Start the screenshot process by first determining if it's an add, update or delete
 */
async function startScreenshot(change, context, lessonType) {
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
  } else if (
    !change.before.exists &&
    change.after.exists &&
    updatedLesson.url
  ) {
    // The document didn't exist previously but it does not and it has a URL
    console.log(
      `New lesson added - getting screenshot for ${updatedLesson.url}`
    )
    await saveScreenshot(context.params.lessonId, updatedLesson.url, lessonType)
  } else if (!originalLesson.url && !updatedLesson.url) {
    // It's still empty so do nothing
    console.log('No changes to URL so doing nothing')
  } else if (originalLesson.url && !updatedLesson.url) {
    // User deleted the URL so delete the image
    console.log(`Deleting file ${originalLesson.url}`)

    const fileToDelete = bucket.file(
      `lessons/${context.params.lessonId}/screenshot.png`
    )
    const info = await fileToDelete.exists()
    if (info.exists) {
      fileToDelete.delete()
    }
    // change.after.ref.set({ url_thumbnail: null }, { merge: true })
  } else if (!originalLesson.url && updatedLesson.url) {
    // User added a URL to an existing lesson, when previously there was none, so let's process it
    console.log(
      `User added a URL when one didn't exist previously ${updatedLesson.url}`
    )
    await saveScreenshot(context.params.lessonId, updatedLesson.url, lessonType)
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
    await saveScreenshot(context.params.lessonId, updatedLesson.url, lessonType)
  } else {
    console.log('Nothing happened')
  }
}

/**
 * Capture the screenshot with Puppeteer and put it in storage. It will store one
 * screenshot per lesson and a separate function (an extension) will resize it
 * for a thumbnail view.
 *
 * Note the ID of the file will be the {document ID}.png
 */
async function saveScreenshot(id, url, lessonTypeToStore) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  // Screenshot size
  await page.setViewport({ width: 1024, height: 768 })

  // Go to your website. The networkidle2 means it waits for almost all
  // network traffic to complete - needed or else I might capture a loading icon
  console.log(`Going to ${url}`)
  await page.goto(url, { waitUntil: 'networkidle2' })

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
    contentType: 'image/png',
    lessonType: lessonTypeToStore
  }
  await file.save(screenshot, metadata)

  return filePath
}
