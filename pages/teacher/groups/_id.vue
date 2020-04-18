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
              {{ groupName }}
            </div>
            <v-btn
              @click="onShowEditGroupName()"
              x-small
              class="mt-1 ml-3"
              icon
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-row>
          <div v-if="groupDescription" class="subtitle-1">
            {{ groupDescription }}
          </div>
        </v-col>
      </v-row>

      <change-group-name
        v-if="showEditName"
        @onSave="onGroupEditSave"
        @onClose="onGroupEditClose"
        :group-name="editGroupName"
        :group-description="editGroupDescription"
        :saving="savingGroupName"
      ></change-group-name>

      <v-row>
        <v-col cols="12" xs="12" class="mx-auto">
          <v-card :disabled="showEditName">
            <v-tabs v-model="tab">
              <v-tab key="students">Students</v-tab>
              <v-tab key="schedule">Lesson Schedule</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <v-tab-item key="students">
                <v-card flat>
                  <group-students
                    :students="allStudentsInOrg"
                    v-on:save-selected-students="onSaveSelectedStudents"
                  ></group-students>
                </v-card>
              </v-tab-item>

              <v-tab-item key="schedule">
                <v-card flat>
                  <group-schedule></group-schedule>
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
import GroupStudents from '~/components/teacher/groups/GroupStudents'
import GroupSchedule from '~/components/teacher/groups/GroupSchedule'
import ChangeGroupName from '~/components/teacher/groups/ChangeGroupName'

export default {
  layout: 'teacher',

  head() {
    return { title: 'Group' }
  },

  components: {
    GroupStudents,
    GroupSchedule,
    ChangeGroupName
  },

  data() {
    return {
      valid: false,
      loading: true,
      tab: null,
      currentOrg: null,
      groupName: null,
      groupDescription: null,
      editGroupName: null,
      editGroupDescription: null,
      savingGroupName: false,
      allStudentsInOrg: [],
      studentsInGroup: [],
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

    // Finally get info about this specific group
    const readGroup = await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('groups')
      .doc(this.$route.params.id)
      .get()

    if (!readGroup.empty) {
      const currentGroup = readGroup.data()
      if (currentGroup) {
        this.groupName = currentGroup.name
        this.groupDescription = currentGroup.description

        // Go through and mark all the selected students
        if (currentGroup.students) {
          this.allStudentsInOrg.forEach((student) => {
            student.selected = currentGroup.students.includes(student.id)
          })
        }

        if (currentGroup.lessons) {
          this.allLessonsInOrg.forEach((lesson) => {
            lesson.selected = currentGroup.lessons.includes(lesson.id)
          })
        }
      }
    }

    this.loading = false
  },

  methods: {
    onShowEditGroupName() {
      this.editGroupName = this.groupName
      this.editGroupDescription = this.groupDescription
      this.showEditName = true
    },
    async onGroupEditSave(editedGroup) {
      if (
        this.groupName !== editedGroup.name ||
        this.groupDescription !== editedGroup.description
      ) {
        this.groupName = editedGroup.name
        this.groupDescription = editedGroup.description
        this.savingGroupName = true

        await firestore
          .collection('organizations')
          .doc(this.orgId)
          .collection('groups')
          .doc(this.$route.params.id)
          .update({
            name: this.groupName,
            description: this.groupDescription
          })
      }

      this.showEditName = false
      this.savingGroupName = false
    },
    onGroupEditClose() {
      this.editGroupName = this.groupName
      this.editGroupDescription = this.groupDescription
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
        .collection('groups')
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
