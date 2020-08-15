<template>
  <v-row class="fill-height mt-2 ml-1">
    <v-col>
      <v-btn
        @click="scheduleLesson()"
        v-if="showScheduleBtn"
        class="primary"
        data-cy="scheduleLessonButton"
        >Schedule a Lesson</v-btn
      >
      <div
        v-if="lessons.length <= 0"
        class="body-1 mt-4 mb-2"
        data-cy="noLessonText"
      >
        Go ahead and schedule some lessons 😊
      </div>
      <v-data-table
        v-else
        :headers="headers"
        :items="lessons"
        @click:row="showScheduledLesson"
        class="mx-3"
      >
        <template v-slot:item.action="{ item }">
          <v-icon @click="editLesson(item)" small class="mr-3">
            mdi-pencil
          </v-icon>
        </template>
        <template v-slot:item.startDateTime="{ item }">
          {{ item.startDateTime | formatDateTime }}
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import date from 'date-and-time'

export default {
  name: 'GroupSchedule',

  filters: {
    formatDateTime(value) {
      if (!value) return ''
      const pattern = date.compile('YYYY-MM-DD h:mm A')
      return date.format(value.toDate(), pattern)
    }
  },

  props: {
    lessons: {
      type: Array,
      default: () => []
    },
    showScheduleBtn: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      saving: null,
      dialogDateMenu: null,
      dialogSelectedLesson: null,
      dialogStartDate: null,
      dialogStartTime: null,
      dialogDuration: null,
      dialogNotes: null,
      headers: [
        { text: 'Date', value: 'startDateTime' },
        { text: 'Name', value: 'lesson.name' },
        { text: 'Category', value: 'lesson.category' }
      ]
    }
  },

  methods: {
    scheduleLesson() {
      this.$router.push(
        `/teacher/groups/${this.$route.params.groupid}/schedule/add`
      )
    },
    showScheduledLesson(lesson) {
      this.$router.push(
        `/teacher/groups/${this.$route.params.groupid}/schedule/${lesson.id}`
      )
    }
  }
}
</script>
