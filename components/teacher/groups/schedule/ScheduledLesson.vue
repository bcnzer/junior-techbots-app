<template>
  <div class="mx-3">
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="card" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <div v-if="!loading">
      <v-form ref="modalAddLesson" lazy-validation>
        <v-row>
          <v-col>
            <v-btn @click="showDialog = true" class="info"
              >Select a Lesson</v-btn
            >
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
              label="Start Time"
              type="time"
              class="ml-2 mr-3"
            ></v-text-field>
          </v-col>
          <v-col cols="12" xs="12" sm="4">
            <v-text-field
              v-model="duration"
              label="Duration"
              type="number"
              suffix="minutes"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-textarea v-model="notes" label="Notes"></v-textarea>
          </v-col>
        </v-row>

        <v-row>
          <v-spacer></v-spacer>
          <v-btn
            @click="saveScheduledLesson()"
            :loading="saving"
            color="primary"
            class="mr-2"
            >Save</v-btn
          >
          <v-btn @click="showDateMenu = false" :disabled="saving" class="mr-2"
            >Cancel</v-btn
          >
        </v-row>
      </v-form>
    </div>

    <v-dialog v-model="showDialog" persistent scrollable max-width="750px">
      <v-form ref="modalStudents" lazy-validation>
        <v-card>
          <v-card-title>
            Lessons
            <v-spacer></v-spacer>
            <v-select
              :items="categories"
              v-model="selectedCategory"
              label="Category"
            ></v-select>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-list-item-group v-model="selectedLesson">
                <v-divider></v-divider>
                <v-list-item v-for="lesson in lessons" :key="lesson.id">
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
                <v-divider></v-divider>
              </v-list-item-group>
            </v-list>
          </v-card-text>
          <v-card-actions class="mr-2 mb-2">
            <v-spacer></v-spacer>
            <v-btn
              @click="saveSelectedStudents()"
              :loading="saving"
              color="primary"
              >Save</v-btn
            >
            <v-btn @click="showDialog = false" :disabled="saving">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import { firestore } from '@/services/fireinit.js'

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
      categories: [],
      selectedCategory: null,
      selectedLesson: null
    }
  },

  async created() {
    this.clubId = JSON.parse(localStorage.club).id

    // Get the lessons
    const lessonsRef = await firestore
      .collection('clubs')
      .doc(this.clubId)
      .collection('lessons')
      .get()

    lessonsRef.forEach((lesson) => {
      const currentLesson = lesson.data()
      this.lessons.push(currentLesson)
    })

    this.loading = false
  },

  methods: {
    showLesson(lesson) {
      return true
    },
    lessonDescription(lesson) {
      return `<span class='text--primary'>${lesson.category}</span> &mdash; ${lesson.description}`
    }
  }
}
</script>
