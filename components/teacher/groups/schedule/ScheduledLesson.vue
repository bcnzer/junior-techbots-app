<template>
  <div class="mx-3">
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="card" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <div v-if="!loading">
      <v-form ref="scheduleLessonForm" lazy-validation>
        <v-row v-if="!selectedLesson" style="min-height: 205px">
          <v-col>
            <div class="headline mb-4">Schedule a Lesson</div>
            <v-btn
              @click="showLessonDialog"
              :loading="selectLessonLoading"
              class="info"
              >Select a Lesson</v-btn
            >
          </v-col>
        </v-row>

        <v-row v-if="selectedLesson" style="min-height: 205px">
          <v-col cols="12" xs="12" sm="3">
            <v-img
              v-if="!selectedImageSrc"
              src="../../../../bots/robots small.png"
              style="filter: blur(2px)"
            ></v-img>
            <v-img
              v-else
              :src="selectedImageSrc"
              lazy-src="../../../../bots/robots small.png"
              width="256"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="amber"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </v-col>
          <v-col cols="12" xs="12" sm="9">
            <v-row>
              <div class="headline mt-2">{{ selectedLessonName }}</div>
              <v-btn @click="onRemoveLesson()" x-small class="mt-3 ml-5" icon>
                <v-icon>mdi-close-circle-outline</v-icon>
              </v-btn>
            </v-row>
            <v-row>
              <div class="subtitle-1">{{ selectedLessonCategory }}</div>
            </v-row>
            <v-row>
              <div class="subtitle">{{ selectedLessonDescription }}</div>
            </v-row>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12" xs="12" sm="4">
            <v-menu
              ref="dateMenu"
              v-model="showDateMenu"
              :close-on-content-click="false"
              :return-value.sync="startDate"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="startDate"
                  v-on="on"
                  :rules="[(v) => !!v || 'Start date is required']"
                  :disabled="saving"
                  label="Date"
                  class="mr-1"
                  readonly
                ></v-text-field>
              </template>
              <v-date-picker v-model="startDate" no-title scrollable>
                <v-spacer></v-spacer>
                <v-btn @click="showDateMenu = false" text color="primary"
                  >Cancel</v-btn
                >
                <v-btn
                  @click="$refs.dateMenu.save(startDate)"
                  text
                  color="primary"
                  >OK</v-btn
                >
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" xs="12" sm="4">
            <v-text-field
              v-model="startTime"
              :rules="[(v) => !!v || 'Time is required']"
              :disabled="saving"
              label="Start Time"
              type="time"
              class="ml-2 mr-3"
            ></v-text-field>
          </v-col>
          <v-col cols="12" xs="12" sm="4">
            <v-text-field
              v-model="duration"
              :rules="[(v) => !!v || 'Duration is required']"
              :disabled="saving"
              label="Duration"
              type="number"
              suffix="minutes"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-textarea
              v-model="notes"
              :disabled="saving"
              label="Notes"
            ></v-textarea>
          </v-col>
        </v-row>

        <v-row>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!selectedLesson"
            @click="saveScheduledLesson()"
            :loading="saving"
            color="primary"
            class="mr-2"
            >Save</v-btn
          >
          <v-btn @click="goBack()" :disabled="saving" class="mr-2"
            >Cancel</v-btn
          >
        </v-row>
      </v-form>
    </div>

    <v-dialog v-model="showDialog" persistent scrollable max-width="500px">
      <v-form ref="modalStudents" lazy-validation>
        <v-card>
          <v-card-title>
            Lessons
            <v-spacer></v-spacer>
            <v-select
              :items="categories"
              v-model="selectedCategory"
              v-if="categories.length > 0"
              label="Category"
              clearable
            ></v-select>
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-list-item-group v-model="selectedLessonIndex">
                <v-list-item
                  v-for="lesson in lessons"
                  :key="lesson.id"
                  v-if="
                    !selectedCategory || lesson.category == selectedCategory
                  "
                >
                  <v-list-item-content>
                    <v-list-item-title v-html="lesson.name"></v-list-item-title>
                    <v-list-item-subtitle
                      v-html="lesson.category"
                      class="text--primary my-1"
                    ></v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-html="lesson.description"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card-text>
          <v-card-actions class="mr-2 mb-2">
            <v-spacer></v-spacer>
            <v-btn
              @click="onLessonSelect()"
              :disabled="selectedLessonIndex == null"
              color="primary"
              >Select</v-btn
            >
            <v-btn @click="showDialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import { firestore, storage } from '@/services/fireinit.js'
import date from 'date-and-time'

export default {
  name: 'ScheduledLesson',

  props: {
    lessonId: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      clubId: null,
      loading: true,
      saving: false,
      dateMenu: null,
      showDateMenu: false,
      startDate: null,
      startTime: null,
      duration: null,
      notes: null,
      showDialog: false,
      lessonSearch: null,
      lessons: [],
      lessonsLoaded: false,
      categories: [],
      selectedCategory: null,
      selectedLesson: null,
      selectedLessonIndex: null,
      selectedImageSrc: '',
      selectLessonLoading: false
    }
  },

  computed: {
    selectedLessonImage() {
      if (!this.selectedLesson) return

      return this.selectedLesson.imageSrc
    },
    selectedLessonName() {
      if (!this.selectedLesson) return

      return this.selectedLesson.name
    },
    selectedLessonDescription() {
      if (!this.selectedLesson) return

      return this.selectedLesson.description
    },
    selectedLessonCategory() {
      if (!this.selectedLesson) return

      return this.selectedLesson.category
    }
  },

  async created() {
    this.clubId = JSON.parse(localStorage.club).id

    if (this.$route.params.scheduleid) {
      const scheduleLessonRef = await firestore
        .collection('clubs')
        .doc(this.clubId)
        .collection('scheduledlessons')
        .doc(this.$route.params.scheduleid)
        .get()

      const scheduledLesson = scheduleLessonRef.data()
      scheduledLesson.id = scheduleLessonRef.id

      this.selectedLesson = scheduledLesson.lesson
      this.selectedImageSrc = await storage
        .ref(`lessons/${this.selectedLesson.id}/screenshot_256x192.png`)
        .getDownloadURL()

      this.startDate = date.format(
        scheduledLesson.startDateTime.toDate(),
        'YYYY-MM-DD'
      )
      this.startTime = date.format(
        scheduledLesson.startDateTime.toDate(),
        'HH:mm'
      )
      this.duration = scheduledLesson.duration
      this.notes = scheduledLesson.notes
    } else {
      // Load the last used settings for time and duration
      const clubInfoRef = await firestore
        .collection('clubs')
        .doc(this.clubId)
        .get()

      const clubData = clubInfoRef.data()
      if (clubData.lastDuration) {
        this.duration = clubData.lastDuration
      }
      if (clubData.lastStartTime) {
        this.startTime = clubData.lastStartTime
      }
    }

    this.loading = false
  },

  methods: {
    async showLessonDialog() {
      if (!this.lessonsLoaded) {
        // Get the lessons
        this.selectLessonLoading = true
        const lessonsRef = await firestore
          .collection('clubs')
          .doc(this.clubId)
          .collection('lessons')
          .get()

        lessonsRef.forEach((lesson) => {
          const currentLesson = lesson.data()
          currentLesson.id = lesson.id
          this.lessons.push(currentLesson)

          if (
            !this.categories.includes(currentLesson.category) &&
            currentLesson.category
          ) {
            this.categories.push(currentLesson.category)
          }
        })

        this.categories.sort()
        this.lessonsLoaded = true
      }

      this.selectLessonLoading = false
      this.showDialog = true
    },
    lessonDescription(lesson) {
      return `<span class='text--primary'>${lesson.category}</span> &mdash; ${lesson.description}`
    },
    async onLessonSelect() {
      if (this.selectedCategory) {
        const filteredLessons = this.lessons.filter(
          (element) => element.category === this.selectedCategory
        )
        this.selectedLesson = filteredLessons[this.selectedLessonIndex]
      } else {
        this.selectedLesson = this.lessons[this.selectedLessonIndex]
      }
      this.showDialog = false

      this.selectedImageSrc = await storage
        .ref(`lessons/${this.selectedLesson.id}/screenshot_256x192.png`)
        .getDownloadURL()
    },
    goBack() {
      this.$router.push(`/teacher/groups/${this.$route.params.groupid}`)
    },
    async saveScheduledLesson() {
      if (this.$refs.scheduleLessonForm.validate()) {
        this.saving = true

        const dataToSave = {
          lesson: this.selectedLesson,
          startDateTime: new Date(`${this.startDate} ${this.startTime}`),
          duration: this.duration,
          notes: this.notes
        }
        if (this.$route.params.scheduleid) {
          await firestore
            .collection('clubs')
            .doc(this.clubId)
            .collection('scheduledlessons')
            .doc(this.$route.params.scheduleid)
            .update(dataToSave)
        } else {
          await firestore
            .collection('clubs')
            .doc(this.clubId)
            .collection('scheduledlessons')
            .add(dataToSave)

          // Also save the duration and time, for use next time as a default
          await firestore
            .collection('clubs')
            .doc(this.clubId)
            .update({
              lastDuration: this.duration,
              lastStartTime: this.startTime
            })
        }

        this.goBack()
        this.saving = false
      }
    },
    onRemoveLesson() {
      this.selectedLesson = null
      this.selectedLessonIndex = null
    }
  }
}
</script>
