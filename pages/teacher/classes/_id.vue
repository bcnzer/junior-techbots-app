<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="table" min-width="300"></v-skeleton-loader>
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
              <v-tab key="schedule">Lessons & Schedule</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item key="details">
                <v-card flat>
                  <v-card-text>
                    <div class="text-right">
                      <v-btn class="mx-right">Add Student</v-btn>
                    </div>
                    <v-list three-line>
                      <template v-for="(student, index) in allStudents">
                        <v-divider
                          v-if="showDivider(index, allStudents.length)"
                          :key="index"
                        ></v-divider>

                        <v-list-item :key="student.id" @click="">
                          <v-list-item-avatar>
                            <v-img :src="student.photoURL"></v-img>
                          </v-list-item-avatar>

                          <v-list-item-content>
                            <v-list-item-title
                              v-html="student.displayName"
                            ></v-list-item-title>
                            <v-list-item-subtitle
                              v-html="student.email"
                            ></v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item key="schedule">
                <v-card flat>
                  <v-card-text>schedule</v-card-text>
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

export default {
  layout: 'teacher',

  head() {
    return { title: 'Class' }
  },

  data() {
    return {
      valid: false,
      loading: true,
      tab: null,
      className: null,
      classDescription: null,
      allStudents: [],
      studentsInClass: [],
      allLessons: [],
      schedule: []
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

    // Get all the students
    const readStudents = await firestore
      .collection('students')
      .where('organizations', 'array-contains', this.orgId)
      .get()

    if (!readStudents.empty) {
      readStudents.docs.forEach((student) => {
        const studentWithId = student.data()
        studentWithId.id = student.id
        this.allStudents.push(studentWithId)
      })
    }
    console.log(this.allStudents)

    // Finally get info about this specific class
    const readClass = await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('classes')
      .doc(this.$route.params.id)
      .get()

    if (!readClass.empty) {
      const currentClass = readClass.data()
      this.className = currentClass.name
      this.classDescription = currentClass.description
    }

    this.loading = false
  },

  methods: {
    showDivider(index, length) {
      if (index <= 0) return false
      if (index < length) return true
      return false
    }
  }
}
</script>
