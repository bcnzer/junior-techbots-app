<template>
  <div>
    <v-btn @click="showLessonDialog()" class="mx-right">Add Lessons</v-btn>

    <v-checkbox label="View completed lessons"></v-checkbox>

    <v-list two-line>
      <template v-for="(lesson, index) in selectedLessons">
        <v-divider :key="lesson.id"></v-divider>

        <v-list-item>
          <v-list-item-icon>
            <v-img
              v-if="lesson.imageSrc != '../../bots/robots small.png'"
              :src="lesson.imageSrc"
              lazy-src="../../bots/robots small.png"
              style="max-width: 128px"
            ></v-img>
            <v-img
              v-if="lesson.imageSrc == '../../bots/robots small.png'"
              :src="lesson.imageSrc"
              style="max-width: 128px; filter: blur(2px)"
            ></v-img>
          </v-list-item-icon>

          <v-list-item-content>
            <h2 class="mb-2">Est date: 20 Mar 2020</h2>
            <h3>{{ lesson.name }}</h3>
            <div>{{ lesson.description }}</div>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn text icon>
              <v-icon>
                mdi-arrow-up-bold
              </v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn text icon>
              <v-icon>
                mdi-arrow-down-bold
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-divider
          v-if="index == selectedLessons.length - 1"
          :key="index"
        ></v-divider>
      </template>
    </v-list>
  </div>
</template>

<script>
import { storage } from '@/services/fireinit.js'

export default {
  name: 'LessonQueue',

  props: {
    lessons: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      search: null,
      showDialog: false,
      saving: false,
      dialogLessons: []
    }
  },

  computed: {
    selectedLessons() {
      return this.lessons.filter((lesson) => {
        return lesson.selected === true
      })
    }
  },

  methods: {
    async getImageUrl(lessonId) {
      try {
        const imageSrc = await storage
          .ref(`lessons/${lessonId}/screenshot_256x192.png`)
          .getDownloadURL()

        return imageSrc
      } catch (error) {
        return null
      }
    },
    showStudent(student) {
      // Based on the search, show the student... or not
      if (!this.search) return true

      const searchLowercase = this.search.toLowerCase()
      return (
        student.displayName.toLowerCase().includes(searchLowercase) ||
        student.email.toLowerCase().includes(searchLowercase)
      )
    },
    showStudentDialog() {
      // Clone the array. That way each time you open the dialog we won't display
      // the previously selected students
      this.search = null
      this.dialogProjects = JSON.parse(JSON.stringify(this.students))
      this.showDialog = true
    },
    saveSelectedStudents() {
      this.$emit('save-selected-projects', this.dialogProjects)
      this.showDialog = false
    }
  }
}
</script>
