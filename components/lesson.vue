<template>
  <div class="mx-3">
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="card" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <div v-if="!loading">
      <v-form ref="formLesson" lazy-validation>
        <v-row>
          <v-col cols="12" xs="12" sm="9" class="mx-auto">
            <v-text-field
              v-model="name"
              :rules="[(v) => !!v || 'Name is required']"
              :disabled="saving"
              label="Name"
              required
            ></v-text-field>
            <v-textarea
              v-model="description"
              :rules="[(v) => !!v || 'Description is required']"
              :disabled="saving"
              label="Description"
              required
            ></v-textarea>
            <v-text-field
              v-model="url"
              :disabled="saving"
              :rules="urlRule"
              label="URL"
            ></v-text-field>
          </v-col>
          <v-col cols="12" xs="12" sm="3" class="mx-auto my-auto">
            <v-img
              v-if="!imageSrc"
              src="../../bots/robots small.png"
              style="opacity: 30%"
              alt="Image preview of the website"
              max-width="256"
            >
            </v-img>
            <a v-else :href="imageSrcLarge" target="_blank">
              <v-img
                :src="imageSrc"
                lazy-src="../../bots/robots small.png"
                max-width="256"
              >
              </v-img>
            </a>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" xs="12" sm="6" class="mx-auto">
            <v-combobox
              v-model="category"
              :items="defaultCategories"
              :disabled="saving"
              label="Category"
            ></v-combobox>
          </v-col>
          <v-col cols="12" xs="12" sm="6" class="mx-auto">
            <v-combobox
              v-model="achievements"
              :items="allAchievements"
              :disabled="saving"
              label="Achievements"
              multiple
              chips
            ></v-combobox>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" xs="12" class="mx-auto">
            <v-textarea
              v-model="messageForParents"
              :disabled="saving"
              label="Message for Parents / Guardians"
            ></v-textarea>
            <v-textarea
              v-model="furtherResources"
              :disabled="saving"
              label="Further Resources"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-spacer></v-spacer>
          <v-btn
            @click="saveLesson"
            :disabled="saving"
            :loading="saving"
            color="primary"
            class="mr-2"
            >Save</v-btn
          >
        </v-row>
      </v-form>
    </div>
  </div>
</template>

<script>
import { firestore, storage } from '@/services/fireinit.js'
export default {
  name: 'Lesson',

  props: {
    lessonId: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      loading: true,
      saving: false,
      currentLessonId: null,
      name: null,
      description: null,
      url: null,
      messageForParents: null,
      furtherResources: null,
      category: null,
      defaultCategories: ['Scratch', 'Python'],
      achievements: null,
      allAchievements: [],
      imageSrc: null,
      imageSrcLarge: null,
      urlRule: [
        (v) => {
          if (
            v &&
            /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(
              v
            ) === false
          ) {
            return 'URL must be valid'
          } else {
            return true
          }
        }
      ]
    }
  },

  async created() {
    this.orgId = JSON.parse(localStorage.org).id

    if (this.lessonId) {
      const listResult = await storage.ref(`lessons/${this.lessonId}`).listAll()

      // How I could check for file existance
      if (listResult.items.length > 0) {
        // Exists!
        this.imageSrc = await storage
          .ref(`lessons/${this.lessonId}/screenshot_256x192.png`)
          .getDownloadURL()

        this.imageSrcLarge = await storage
          .ref(`lessons/${this.lessonId}/screenshot.png`)
          .getDownloadURL()
      }

      this.currentLessonId = this.lessonId
      const lesson = await firestore
        .collection('organizations')
        .doc(this.orgId)
        .collection('lessons')
        .doc(this.lessonId)
        .get()

      const lessonData = lesson.data()

      this.name = lessonData.name
      if (lessonData.description) {
        this.description = lessonData.description
      }
      if (lessonData.url) {
        this.url = lessonData.url
      }
      if (lessonData.url) {
        this.urlPreview = lessonData.url
      }
      if (lessonData.url) {
        this.messageForParents = lessonData.messageForParents
      }
      if (lessonData.url) {
        this.furtherResources = lessonData.furtherResources
      }
      if (lessonData.url) {
        this.category = lessonData.category
      }
      if (lessonData.url) {
        this.achievements = lessonData.achievements
      }
    }

    this.loading = false
  },

  methods: {
    async saveLesson() {
      if (this.$refs.formLesson.validate()) {
        this.saving = true
        const collection = firestore
          .collection('organizations')
          .doc(this.orgId)
          .collection('lessons')

        const lesson = {
          name: this.name,
          description: this.description,
          url: this.url,
          category: this.category,
          achievements: this.achievements,
          messageForParents: this.messageForParents,
          furtherResources: this.furtherResources
        }
        console.log(lesson)

        if (!this.currentLessonId) {
          const newLesson = await collection.add(lesson)
          this.currentLessonId = newLesson.id
        } else {
          await collection.doc(this.lessonId).update(lesson)
        }

        this.saving = false
        this.$router.push('/teacher/lessons')
      }
    }
  }
}
</script>
