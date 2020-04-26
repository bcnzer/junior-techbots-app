// NOTE - the docs to the Cloud Storage API https://googleapis.dev/nodejs/storage/latest/File.html#exists
const sharp = require('sharp')
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
    await deleteScreenshots(bucket, context.params.lessonId)
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
    await deleteScreenshots(bucket, context.params.lessonId)
  } else if (!originalLesson.url && updatedLesson.url) {
    // User added a URL to an existing lesson, when previously there was none, so let's process it
    console.log(
      `User added a URL when one didn't exist previously ${updatedLesson.url}`
    )
    await saveScreenshot(context.params.lessonId, updatedLesson.url, lessonType)
  } else if (originalLesson.url !== updatedLesson.url) {
    // URL changed so delete the previous image and create a new one
    await deleteScreenshots(bucket, context.params.lessonId)

    console.log('Saving screenshot as the URL changed')
    await saveScreenshot(context.params.lessonId, updatedLesson.url, lessonType)
  } else {
    console.log('Nothing happened')
  }
}

/**
 * Delete the original screenshot and the thumbnail
 */
async function deleteScreenshots(bucket, id) {
  const originalFile = bucket.file(`lessons/${id}/screenshot.png`)

  const originalFileInfo = await originalFile.exists()
  console.log(originalFileInfo)
  if (originalFileInfo[0] === true) {
    console.log('original exists')
    originalFile.delete()
  }

  // Also delete the thumbnail
  const thumbnailFile = bucket.file(`lessons/${id}/screenshot_256x192.png`)

  const thumbnailFileInfo = await thumbnailFile.exists()
  if (thumbnailFileInfo[0] === true) {
    console.log('thumbnail exists')
    thumbnailFile.delete()
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
  const screenshotBuffer = await page.screenshot()

  await browser.close()

  const bucket = admin.storage().bucket()

  // Create a file object
  const filePath = `lessons/${id}/screenshot.png`
  const metadata = {
    contentType: 'image/png',
    lessonType: lessonTypeToStore
  }
  await saveFileToStorage(bucket, screenshotBuffer, filePath, metadata)
  // console.log(`Creating file at ${filePath}`)
  // const file = bucket.file(filePath)

  // // Save the image
  // console.log(`Saving file`)

  // await file.save(screenshot, metadata)

  // Create a thumbnail
  const thumbnailBuffer = await sharp(screenshotBuffer)
    .resize(256, 192)
    .toBuffer()

  const thumbnailPath = `lessons/${id}/screenshot_256x192.png`
  console.log(`Creating file at ${thumbnailPath}`)
  await saveFileToStorage(bucket, thumbnailBuffer, thumbnailPath, metadata)
  // const thumbnailFile = bucket.file(thumbnailPath)

  // // Save the image
  // console.log(`Saving file`)
  // await thumbnailFile.save(thumbnail, metadata)
}

async function saveFileToStorage(bucket, buffer, filePath, metadata) {
  const file = bucket.file(filePath)

  await file.save(buffer, metadata)
}
