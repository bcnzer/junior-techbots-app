// Initialize Algolia, requires installing Algolia dependencies:
// https://www.algolia.com/doc/api-client/javascript/getting-started/#install
//
// App ID and API Key are stored in functions config variables
// Use firebase functions:config:get to see all the config variables
//
// NOTE: I had to run this to add permission to generate signed tokens
// https://stackoverflow.com/questions/53305784/signingerror-with-firebase-getsignedurl
const algoliasearch = require('algoliasearch')
const functions = require('firebase-functions')
const admin = require('firebase-admin')

const ALGOLIA_ID = functions.config().algolia.app_id
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key

const ALGOLIA_INDEX_NAME = 'staging_lessons'
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY)

exports.updateIndex = functions.firestore
  .document('publiclessons/{lessonId}')
  .onWrite(async (change, context) => {
    if (change.before.exists && !change.after.exists) {
      // The whole document was deleted
      const deletedLesson = change.before.data()
      console.log(
        `Deleted ${deletedLesson.name} - ID ${context.params.lessonId}`
      )
      const index = client.initIndex(ALGOLIA_INDEX_NAME)
      return index.deleteObject(context.params.lessonId)
    } else {
      // Newly added or updated document
      const publicLesson = change.after.data()
      if (!publicLesson.name || !publicLesson.category) {
        console.log('Record was missing a name or category')
        return
      }
      console.log(`Saved ${publicLesson.name} - ID ${context.params.lessonId}`)

      const bucket = admin.storage().bucket()
      const thumbnailImage = bucket.file(
        `lessons/${context.params.lessonId}/screenshot_256x192.png`
      )
      const thumbnailImageUrl = await thumbnailImage.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      })
      const fullsizeImage = bucket.file(
        `lessons/${context.params.lessonId}/screenshot.png`
      )
      const fullsizeImageUrl = await fullsizeImage.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      })

      const searchLesson = {
        objectID: context.params.lessonId, // Add an 'objectID' field which Algolia requires
        name: publicLesson.name,
        description: publicLesson.description,
        language: publicLesson.language,
        source: publicLesson.source,
        category: publicLesson.category,
        achievements: publicLesson.achievements,
        url: publicLesson.url,
        imageUrl: thumbnailImageUrl[0],
        imageFullSizeUrl: fullsizeImageUrl[0]
      }

      // Write to the algolia index. If the object exists it will get fully overwritten
      const index = client.initIndex(ALGOLIA_INDEX_NAME)
      return index.saveObject(searchLesson)
    }
  })
