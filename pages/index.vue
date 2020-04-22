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
      <v-row>
        <v-col class="text-center my-5">
          <div class="display-1">
            Welcome to Junior Techbots
          </div>
          <div class="sub-heading">
            Please select your view
          </div>
        </v-col>
      </v-row>
      <v-row>
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
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import viewtype from '~/components/viewtype'

export default {
  layout: 'minimal',

  components: {
    viewtype
  },

  data() {
    return {
      loading: true,
      enableStudentButton: false
    }
  },

  async mounted() {
    console.log(localStorage.currentUser)
    const currentUserUid = JSON.parse(localStorage.currentUser).uid
    const studentRecord = await firestore
      .collection('students')
      .where('uid', '==', currentUserUid)
      .get()

    this.enableStudentButton = studentRecord.docs.length > 0

    this.loading = false
  },

  methods: {
    teacher() {
      this.$router.push('/teacher')
    },

    student() {
      this.$router.push('/student')
    }
  }
}
</script>
