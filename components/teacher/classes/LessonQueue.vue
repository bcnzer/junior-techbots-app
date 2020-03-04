<template>
  <div>
    <v-btn @click="showLessonDialog()" class="mx-right">Add Lessons</v-btn>

    <div class="title my-3">{{ selectedLessons.length }} lessons</div>
    <v-timeline dense>
      <v-timeline-item
        v-for="(lesson, index) in selectedLessons"
        :key="index"
        small
        right
      >
        <template v-slot:opposite>
          <span
            :class="`headline font-weight-bold blue--text`"
            v-text="lesson.name"
          ></span>
        </template>
        <div class="py-4">
          <h2 :class="`headline font-weight-light mb-4 blue--text`">
            {{ lesson.name }}
          </h2>
          <div>{{ lesson.description }}</div>
        </div>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>

<script>
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
    showStudent(student) {
      // Based on the search, show the student... or not
      if (!this.search) return true

      const searchLowercase = this.search.toLowerCase()
      return (
        student.displayName.toLowerCase().includes(searchLowercase) ||
        student.email.toLowerCase().includes(searchLowercase)
      )
    },
    showDivider(index, length) {
      if (index <= 0) return false
      if (index < length) return true
      return false
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
