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
            <div class="ml-3 headline" data-cy="groupName">
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
          <div
            v-if="groupDescription"
            class="subtitle-1"
            data-cy="groupDescription"
          >
            {{ groupDescription }}
          </div>
        </v-col>
        <v-spacer></v-spacer>
        <v-menu bottom left>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon class="mt-3">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="showAddGroup = true">
              <v-list-item-title>Add new group</v-list-item-title>
            </v-list-item>
            <v-list-item @click="showDeleteConfirmationDialog = true">
              <v-list-item-title>Delete group</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-row>

      <add-edit-group
        :show="showAddGroup"
        @onSave="onAddGroup"
        @onClose="onCloseGroup"
      ></add-edit-group>

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
              <v-tab key="schedule">{{ lessonScheduleTabHeader }}</v-tab>
              <v-tab key="completedLessons" data-cy="completedLessonsTab">{{
                completedScheduleTabHeader
              }}</v-tab>
              <v-tab key="students">{{ studentsTabHeader }}</v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
              <v-tab-item key="schedule">
                <v-card flat>
                  <group-schedule
                    :lessons="scheduledLessonsFuture"
                    :show-schedule-btn="true"
                  ></group-schedule>
                </v-card>
              </v-tab-item>

              <v-tab-item key="completedLessons">
                <v-card flat>
                  <group-schedule
                    :lessons="scheduledLessonsCompleted"
                    :show-schedule-btn="false"
                  ></group-schedule>
                </v-card>
              </v-tab-item>

              <v-tab-item key="students">
                <v-card flat>
                  <group-students
                    :students="allStudentsInClub"
                    v-on:save-selected-students="onSaveSelectedStudents"
                  ></group-students>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>

      <confirmation-dialog
        :showDialog="showDeleteConfirmationDialog"
        @on-dialog-confirmation="onDeleteConfirmation()"
        @on-dialog-cancel="onDeleteCancel()"
        :id="$route.params.groupid"
        :text="confirmationDialogMessage"
        title="Delete Group?"
      />
    </div>
  </v-container>
</template>

<script>
import { firestore, storage } from '@/services/fireinit.js'
import GroupStudents from '~/components/teacher/groups/GroupStudents'
import GroupSchedule from '~/components/teacher/groups/GroupSchedule'
import ChangeGroupName from '~/components/teacher/groups/ChangeGroupName'
import AddEditGroup from '~/components/teacher/groups/AddEditGroup'
import ConfirmationDialog from '~/components/ConfirmationDialog'

export default {
  layout: 'teacher',

  head() {
    return { title: 'Group' }
  },

  components: {
    GroupStudents,
    GroupSchedule,
    ChangeGroupName,
    AddEditGroup,
    ConfirmationDialog
  },

  data() {
    return {
      loading: true,
      tab: null,
      groupName: null,
      groupDescription: null,
      editGroupName: null,
      editGroupDescription: null,
      savingGroupName: false,
      allStudentsInClub: [],
      allLessonsInClub: [],
      scheduledLessonsFuture: [], // Today or in the future
      scheduledLessonsCompleted: [], // In the past
      showEditName: false,
      showAddGroup: false,
      showDeleteConfirmationDialog: false
    }
  },

  computed: {
    confirmationDialogMessage() {
      return `Are you sure you want to delete '${this.groupName}'?`
    },
    completedScheduleTabHeader() {
      if (this.scheduledLessonsCompleted.length === 0)
        return 'Completed Lessons'

      return `Completed Lessons (${this.scheduledLessonsCompleted.length})`
    },
    lessonScheduleTabHeader() {
      if (this.scheduledLessonsFuture.length === 0) return 'Lesson Schedule'

      return `Lesson Schedule (${this.scheduledLessonsFuture.length})`
    },
    studentsTabHeader() {
      if (this.allStudentsInClub.length === 0) return 'Students'

      return `Students (${this.allStudentsInClub.length})`
    }
  },

  async created() {
    this.clubId = JSON.parse(localStorage.club).id

    // Get all the possible lessons
    const readLessons = await firestore
      .collection('clubs')
      .doc(this.clubId)
      .collection('lessons')
      .get()

    if (!readLessons.empty) {
      readLessons.docs.forEach((lesson) => {
        const lessonWithId = lesson.data()
        lessonWithId.id = lesson.id
        this.allLessonsInClub.push(lessonWithId)
      })

      // Now fetch their images
      this.allLessonsInClub.forEach(async (lesson) => {
        let imageSrc
        try {
          imageSrc = await storage
            .ref(`lessons/${lesson.id}/screenshot_256x192.png`)
            .getDownloadURL()
        } catch (error) {
          // By keeping it undefined the fuzzy, lazy loaded image is used
          imageSrc = '../../bots/robots small.png'
        }
        lesson.imageSrc = imageSrc
      })
    }

    // Get all the students in the club - everyone possible
    const readStudents = await firestore
      .collection('students')
      .where('clubs', 'array-contains', this.clubId)
      .get()

    if (!readStudents.empty) {
      readStudents.docs.forEach((student) => {
        const studentWithId = student.data()
        studentWithId.id = student.id
        this.allStudentsInClub.push(studentWithId)
      })
    }

    // Get the scheduled lessons and break them up into future and completed
    const readSchedule = await firestore
      .collection('clubs')
      .doc(this.clubId)
      .collection('scheduledlessons')
      .get()

    if (!readSchedule.empty) {
      const currentDateTime = Date.now()
      readSchedule.docs.forEach((readScheduledLesson) => {
        const scheduledLesson = readScheduledLesson.data()
        scheduledLesson.id = readScheduledLesson.id
        scheduledLesson.date = scheduledLesson.startDateTime.toDate()

        if (scheduledLesson.date > currentDateTime) {
          this.scheduledLessonsFuture.push(scheduledLesson)
        } else {
          this.scheduledLessonsCompleted.push(scheduledLesson)
        }
      })
      this.scheduledLessonsCompleted = this.scheduledLessonsCompleted.sort(
        (a, b) => {
          if (a.date === b.date) return 0
          return a.date > b.date ? 1 : -1
        }
      )
      this.scheduledLessonsFuture = this.scheduledLessonsFuture.sort((a, b) => {
        if (a.date === b.date) return 0
        return a.date > b.date ? 1 : -1
      })
    }

    // Finally get info about this specific group
    const readGroup = await firestore
      .collection('clubs')
      .doc(this.clubId)
      .collection('groups')
      .doc(this.$route.params.groupid)
      .get()

    if (!readGroup.empty) {
      const currentGroup = readGroup.data()
      if (currentGroup) {
        this.groupName = currentGroup.name
        this.groupDescription = currentGroup.description

        // Go through and mark all the selected students
        if (currentGroup.students) {
          this.allStudentsInClub.forEach((student) => {
            student.selected = currentGroup.students.includes(student.id)
          })
        }

        if (currentGroup.lessons) {
          this.allLessonsInClub.forEach((lesson) => {
            lesson.selected = currentGroup.lessons.includes(lesson.id)
          })
        }
      }
    }

    this.loading = false
  },

  methods: {
    async onDeleteConfirmation() {
      await firestore
        .collection('clubs')
        .doc(this.clubId)
        .collection('groups')
        .doc(this.$route.params.groupid)
        .delete()

      this.$router.push('/teacher/groups')
    },
    onDeleteCancel() {
      this.showDeleteConfirmationDialog = false
    },
    onCloseGroup() {
      this.showAddGroup = false
    },
    async onAddGroup(addedGroup) {
      delete addedGroup.id

      const newGroup = await firestore
        .collection('clubs')
        .doc(this.clubId)
        .collection('groups')
        .add(addedGroup)

      this.$router.push(`/teacher/groups/${newGroup.id}`)
    },
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
          .collection('clubs')
          .doc(this.clubId)
          .collection('groups')
          .doc(this.$route.params.groupid)
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
    async onSaveSelectedStudents(students) {
      this.allStudentsInClub = students
      const selectedStudents = students
        .filter((currentStudent) => currentStudent.selected)
        .map((selectedStudent) => selectedStudent.id)

      await firestore
        .collection('clubs')
        .doc(this.clubId)
        .collection('groups')
        .doc(this.$route.params.groupid)
        .update({
          students: selectedStudents
        })
    }
  }
}
</script>
