<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader
          type="table-heading"
          min-width="300"
        ></v-skeleton-loader>
        <v-skeleton-loader
          type="list-item-avatar-three-line"
          min-width="300"
        ></v-skeleton-loader>
        <v-skeleton-loader
          type="list-item-avatar-three-line"
          min-width="300"
        ></v-skeleton-loader>
        <v-skeleton-loader
          type="list-item-avatar-three-line"
          min-width="300"
        ></v-skeleton-loader>
      </v-col>
    </v-row>

    <div v-if="!loading">
      <v-row>
        <v-col cols="12" xs="12" class="mx-auto">
          <div class="title">{{ className }}</div>
          <div v-if="classDescription" class="subtitle-1">
            {{ classDescription }}
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" xs="12" class="mx-auto">
          <v-card>
            <v-tabs v-model="tab">
              <v-tab key="details">Students</v-tab>
              <v-tab key="projectQueue">Project Queue</v-tab>
              <v-tab key="schedule">schedule</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item key="details">
                <v-card flat>
                  <v-card-text>
                    <class-students
                      :students="allStudentsInOrg"
                      v-on:save-selected-students="onSaveSelectedStudents"
                    ></class-students>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item key="projectQueue">
                <v-card flat>
                  <v-card-text>schedule</v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item key="schedule">
                <v-card flat>
                  <!-- insert calendar cmponent here -->
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import ClassStudents from '~/components/teacher/classes/ClassStudents'

export default {
  layout: 'teacher',

  head() {
    return { title: 'Class' }
  },

  components: {
    ClassStudents
  },

  data() {
    return {
      valid: false,
      loading: true,
      tab: null,
      className: null,
      currentOrg: null,
      classDescription: null,
      allStudentsInOrg: [],
      studentsInClass: [],
      allLessons: [],
      schedule: [],
      focus: '',
      calendarType: 'month',
      calendarTypes: ['month', 'week', 'day', '4day'],
      calendarValue: '',
      calendarEvents: [],
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        '4day': '4 Days'
      }
    }
  },

  computed: {
    title() {
      const { start, end } = this
      if (!start || !end) {
        return ''
      }

      const startMonth = this.monthFormatter(start)
      const endMonth = this.monthFormatter(end)
      const suffixMonth = startMonth === endMonth ? '' : endMonth

      const startYear = start.year
      const endYear = end.year
      const suffixYear = startYear === endYear ? '' : endYear

      const startDay = start.day + this.nth(start.day)
      const endDay = end.day + this.nth(end.day)

      switch (this.type) {
        case 'month':
          return `${startMonth} ${startYear}`
        case 'week':
        case '4day':
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
        case 'day':
          return `${startMonth} ${startDay} ${startYear}`
      }
      return ''
    }
  },

  async created() {
    this.orgId = JSON.parse(localStorage.org).id

    // Get all the possible lessons
    const readLessons = await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('lessons')
      .get()

    if (!readLessons.empty) {
      readLessons.docs.forEach((lesson) => {
        const lessonWithId = lesson.data()
        lessonWithId.id = lesson.id
        this.allLessons.push(lessonWithId)
      })
    }

    // Get all the students in the organization - everyone possible
    const readStudents = await firestore
      .collection('students')
      .where('organizations', 'array-contains', this.orgId)
      .get()

    if (!readStudents.empty) {
      readStudents.docs.forEach((student) => {
        const studentWithId = student.data()
        studentWithId.id = student.id
        this.allStudentsInOrg.push(studentWithId)
      })
    }

    // Finally get info about this specific class
    const readClass = await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('classes')
      .doc(this.$route.params.id)
      .get()

    if (!readClass.empty) {
      const currentClass = readClass.data()
      if (currentClass) {
        this.className = currentClass.name
        this.classDescription = currentClass.description

        // Go through and mark all the selected students
        this.allStudentsInOrg.forEach((student) => {
          student.selected = currentClass.students.includes(student.id)
        })
      }
    }

    this.loading = false
  },

  methods: {
    async onSaveSelectedStudents(students) {
      this.allStudentsInOrg = students
      const selectedStudents = students
        .filter((currentStudent) => currentStudent.selected)
        .map((selectedStudent) => selectedStudent.id)

      await firestore
        .collection('organizations')
        .doc(this.orgId)
        .collection('classes')
        .doc(this.$route.params.id)
        .update({
          students: selectedStudents
        })
    },
    viewDay({ date }) {
      this.focus = date
      this.type = 'day'
    },
    getEventColor(event) {
      return event.color
    },
    setToday() {
      this.focus = this.today
    },
    prev() {
      this.$refs.calendar.prev()
    },
    next() {
      this.$refs.calendar.next()
    },
    showDivider(index, length) {
      if (index <= 0) return false
      if (index < length) return true
      return false
    }
  }
}
</script>
