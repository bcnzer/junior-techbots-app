<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader
          type="card"
          class="mx-auto"
          max-width="512"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" xs="12" class="mx-auto">
        <v-layout
          v-if="!loading && !classCreated"
          column
          justify-center
          align-center
        >
          <v-flex xs12>
            <div class="text-center my-5">
              <v-img src="/bots/robots small.png"></v-img>
            </div>
          </v-flex>
          <v-flex xs12>
            <div class="headline">
              Welcome to Junior Techbots!
            </div>
          </v-flex>
          <v-flex xs12>
            <div>
              To get started, click here to create your first class
            </div>
          </v-flex>
          <v-flex xs12>
            <v-btn large class="primary mt-5">Create a class</v-btn>
          </v-flex>
        </v-layout>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'

export default {
  layout: 'teacher',

  head() {
    return { title: 'Teacher' }
  },

  data() {
    return {
      loading: true,
      classCreated: false
    }
  },

  async created() {
    this.orgId = JSON.parse(localStorage.org).id

    console.log(this.orgId)
    const classes = await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('classes')
      .get()

    this.classCreated = classes.docs.length > 0
    localStorage.classCreated = this.classCreated

    this.loading = false
  }
}
</script>
