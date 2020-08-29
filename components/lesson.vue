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
          <v-btn
            v-if="currentLessonId"
            @click="showDeleteConfirmationDialog = true"
            color="error"
            dark
            >Delete</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            @click="saveLesson"
            :disabled="saving"
            :loading="saving"
            color="primary"
            class="mr-2"
            >Save</v-btn
          >
          <v-btn :disabled="saving" to="/teacher/lessons" class="mr-2"
            >Cancel</v-btn
          >
        </v-row>
      </v-form>
    </div>

    <confirmation-dialog
      :showDialog="showDeleteConfirmationDialog"
      @on-dialog-confirmation="onDeleteConfirmation()"
      @on-dialog-cancel="onDeleteCancel()"
      :id="$route.params.id"
      :text="confirmationDialogMessage"
      title="Delete Lesson?"
    />
  </div>
</template>

<script>
// import { firestore, storage } from '@/services/fireinit.js'
import { firestore, storage } from '@/services/fireinit.js'
import ConfirmationDialog from '~/components/ConfirmationDialog'

export default {
  name: 'Lesson',

  components: {
    ConfirmationDialog
  },

  props: {
    scheduledLessonId: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      clubId: null,
      defaultCategories: [],
      showDeleteConfirmationDialog: false,
      name: null,
      description: null,
      url: null,
      allAchievements: [],
      messageForParents: null,
      furtherResources: null,
      achievements: [],
      urlRule: [(v) => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid'],
      category: null,
      loading: true,
      saving: false,
      currentLessonId: null,
      imageSrc: null,
      imageSrcLarge: null
    }
  },

  computed: {
    confirmationDialogMessage() {
      return `Are you sure you want to delete '${this.name}'?`
    }
  },

  async created() {
    this.clubId = JSON.parse(localStorage.club).id
    //  this.defaultCategories = "TODO"
    // TODO - figure out achievements

    if (this.scheduledLessonId) {
      const lesson = await firestore
        .collection('clubs')
        .doc(this.clubId)
        .collection('lessons')
        .doc(this.$route.params.id)
        .get()

      const lessonData = lesson.data()
      this.name = lessonData.name
      this.description = lessonData.description
      this.url = lessonData.url
      this.category = lessonData.category
      // TODO - achievements
      this.messageForParents = lessonData.messageForParents
      this.furtherResources = lessonData.furtherResources

      // Load the picture, if there is one
      this.imageSrc = await storage
        .ref(`lessons/${lesson.id}/screenshot_256x192.png`)
        .getDownloadURL()
      this.imageSrcLarge = await storage
        .ref(`lessons/${lesson.id}/screenshot.png`)
        .getDownloadURL()
    }

    this.loading = false
  },

  methods: {
    async onDeleteConfirmation() {
      await firestore
        .collection('clubs')
        .doc(this.clubId)
        .collection('lessons')
        .doc(this.$route.params.id)
        .delete()

      this.$router.push('/teacher/lessons')
    },
    onDeleteCancel() {
      this.showDeleteConfirmationDialog = false
    },
    async saveLesson() {
      if (this.$refs.formLesson.validate()) {
        this.saving = true
        const collection = firestore
          .collection('clubs')
          .doc(this.clubId)
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
