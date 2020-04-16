<template>
  <v-container>
    <v-col v-if="loading" cols="12" xs="12" class="mx-auto">
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

    <div v-if="!loading">
      <v-row v-if="!showEditName">
        <v-col>
          <v-row>
            <div class="ml-3 headline">
              {{ className }}
            </div>
            <v-btn
              @click="onShowEditClassName()"
              x-small
              class="mt-1 ml-3"
              icon
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-row>
          <div v-if="classDescription" class="subtitle-1">
            {{ classDescription }}
          </div>
        </v-col>
      </v-row>

      <change-class-name
        v-if="showEditName"
        @onSave="onClassEditSave"
        @onClose="onClassEditClose"
        :class-name="editClassName"
        :class-description="editClassDescription"
        :saving="savingClassName"
      ></change-class-name>

      <v-row>
        <v-col cols="12" xs="12" class="mx-auto">
          <v-card :disabled="showEditName">
            <v-tabs v-model="tab">
              <v-tab key="details">Students</v-tab>
              <v-tab key="schedule">Lesson Schedule</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <v-tab-item key="details">
                <v-card flat>
                  <class-students
                    :students="allStudentsInOrg"
                    v-on:save-selected-students="onSaveSelectedStudents"
                  ></class-students>
                </v-card>
              </v-tab-item>

              <v-tab-item key="schedule">
                <v-card flat>
                  <class-schedule></class-schedule>
                </v-card>
              </v-tab-item>

              <v-tab-item key="lessonQueue">
                <v-card flat>
                  <lesson-queue
                    :lessons="allLessonsInOrg"
                    v-on:save-selected-lessons="onSaveSelectedLessons"
                  ></lesson-queue>
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
import { firestore, storage } from '@/services/fireinit.js'
import ClassStudents from '~/components/teacher/classes/ClassStudents'
import ClassSchedule from '~/components/teacher/classes/ClassSchedule'
import ChangeClassName from '~/components/teacher/classes/ChangeClassName'

export default {
  layout: 'teacher',

  head() {
    return { title: 'Class' }
  },

  components: {
    ClassStudents,
    ClassSchedule,
    ChangeClassName
  },

  data() {
    return {
      valid: false,
      loading: true,
      tab: null,
      currentOrg: null,
      className: null,
      classDescription: null,
      editClassName: null,
      editClassDescription: null,
      savingClassName: false,
      allStudentsInOrg: [],
      studentsInClass: [],
      allLessonsInOrg: [],
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
      },
      showEditName: false
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
        this.allLessonsInOrg.push(lessonWithId)
      })

      // Now fetch their images
      this.allLessonsInOrg.forEach(async (lesson) => {
        let imageSrc
        try {
          imageSrc = await storage
            .ref(`lessons/${lesson.id}/screenshot_256x192.png`)
            .getDownloadURL()
          console.log(imageSrc)
        } catch (error) {
          // By keeping it undefined the fuzzy, lazy loaded image is used
          imageSrc = '../../bots/robots small.png'
        }
        lesson.imageSrc = imageSrc
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
        if (currentClass.students) {
          this.allStudentsInOrg.forEach((student) => {
            student.selected = currentClass.students.includes(student.id)
          })
        }

        if (currentClass.lessons) {
          this.allLessonsInOrg.forEach((lesson) => {
            lesson.selected = currentClass.lessons.includes(lesson.id)
          })
        }
      }
    }

    this.loading = false
  },

  methods: {
    onShowEditClassName() {
      this.editClassName = this.className
      this.editClassDescription = this.classDescription
      this.showEditName = true
    },
    async onClassEditSave(editedClass) {
      if (
        this.className !== editedClass.name ||
        this.classDescription !== editedClass.description
      ) {
        this.className = editedClass.name
        this.classDescription = editedClass.description
        this.savingClassName = true

        await firestore
          .collection('organizations')
          .doc(this.orgId)
          .collection('classes')
          .doc(this.$route.params.id)
          .update({
            name: this.className,
            description: this.classDescription
          })
      }

      this.showEditName = false
      this.savingClassName = false
    },
    onClassEditClose() {
      this.editClassName = this.className
      this.editClassDescription = this.classDescription
      this.showEditName = false
    },
    onSaveSelectedLessons(lessons) {
      // TODO
    },
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
