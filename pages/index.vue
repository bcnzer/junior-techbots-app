<template>
  <v-container>
    <div v-if="loading">
      <v-row>
        <v-col class="mx-auto">
          <v-skeleton-loader type="heading"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="mx-auto">
          <v-skeleton-loader type="image"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="mx-auto">
          <v-skeleton-loader type="image"></v-skeleton-loader>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <div v-if="studentClubCount == 0 && teacherClubCount == 0">
        <div class="display-1 text-center mx-auto my-5">
          You are not a member of a club
        </div>
        <div class="headline text-center my-5">
          <b>Students</b>: ask the person running the club for an invite!
        </div>
        <v-img
          src="/bots/robot-sorry1.png"
          max-width="150"
          class="mx-auto"
        ></v-img>
        <div class="heading text-center mt-5">
          If you are a teacher, click here to
          <nuxt-link to="/clubsetup">Create a Club</nuxt-link>
        </div>
      </div>
      <!-- <v-row>
        <v-col cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="mx-auto">
          <viewtype
            @card-clicked="student()"
            :disabled="!enableStudentButton"
            image="bots/student-portrait.png"
            button-text="student"
          ></viewtype>
        </v-col>
        <v-col cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="mx-auto">
          <viewtype
            @card-clicked="teacher()"
            image="bots/teacher-portrait.png"
            button-text="teacher"
          ></viewtype>
        </v-col>
      </v-row> -->
    </div>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'

export default {
  layout: 'minimal',

  data() {
    return {
      loading: true,
      studentClubCount: 0,
      teacherClubCount: 0
    }
  },

  async mounted() {
    const currentUserUid = JSON.parse(localStorage.currentUser).uid
    const studentRecord = await firestore
      .collection('students')
      .where('uid', '==', currentUserUid)
      .get()

    const teacherRecord = await firestore
      .collection('teachers')
      .where('uid', '==', currentUserUid)
      .get()

    let studentClubs
    let teacherClubs
    this.studentClubCount = studentRecord.docs.length
    if (this.studentClubCount > 0) {
      studentClubs = studentRecord.docs[0].data()
      this.studentClubCount = studentClubs.clubs.length
    }
    this.teacherClubCount = teacherRecord.docs.length
    if (this.teacherClubCount > 0) {
      teacherClubs = teacherRecord.docs[0].data()
      this.teacherClubCount = teacherClubs.clubs.length
    }
    console.log(this.studentClubCount)
    console.log(this.teacherClubCount)

    if (this.studentClubCount === 0 && this.teacherClubCount === 1) {
      // They're only in one club so forward them
      const onlyTeacherClubResponse = await firestore
        .collection('clubs')
        .doc(teacherClubs.clubs[0])
        .get()

      const onlyTeacherClub = onlyTeacherClubResponse.data()
      localStorage.club = JSON.stringify({
        id: onlyTeacherClubResponse.id,
        name: onlyTeacherClub.name
      })

      this.$router.push('/teacher')
    } else if (this.studentClubCount === 1 && this.teacherClubCount === 0) {
      // They're only in one club so go straight to it
      const onlyStudentClubResponse = await firestore
        .collection('clubs')
        .doc(studentClubs.clubs[0])
        .get()

      const onlyStudentClub = onlyStudentClubResponse.data()
      localStorage.club = JSON.stringify({
        id: onlyStudentClubResponse.id,
        name: onlyStudentClub.name
      })

      console.log(onlyStudentClub.id)
      this.$router.push(`/student/${onlyStudentClub.id}`)
    } else {
      // TODO - need to handle multiple clubs
      console.log(
        'TODO - need to build a screen to allow you to pick one of the clubs you want to log into'
      )
    }

    this.loading = false
  },

  methods: {
    teacher() {
      this.$router.push('/teacher/group')
    },

    student() {
      this.$router.push('/student')
    }
  }
}
</script>
