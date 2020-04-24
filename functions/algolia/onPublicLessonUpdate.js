// Initialize Algolia, requires installing Algolia dependencies:
// https://www.algolia.com/doc/api-client/javascript/getting-started/#install
//
// App ID and API Key are stored in functions config variables
// Use firebase functions:config:get to see all the config variables
const algoliasearch = require('algoliasearch')
const functions = require('firebase-functions')

const ALGOLIA_ID = functions.config().algolia.app_id
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key

const ALGOLIA_INDEX_NAME = 'staging_lessons'
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY)

exports.onPublicLessonUpdate = functions.firestore
  .document('publiclessons/{lessonId}')
  .onWrite((change, context) => {
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

      const searchLesson = {
        objectID: context.params.lessonId, // Add an 'objectID' field which Algolia requires
        name: publicLesson.name,
        category: publicLesson.category,
        achievements: publicLesson.achievements
      }

      // Write to the algolia index. If the object exists it will get fully overwritten
      const index = client.initIndex(ALGOLIA_INDEX_NAME)
      return index.saveObject(searchLesson)
    }
  })
