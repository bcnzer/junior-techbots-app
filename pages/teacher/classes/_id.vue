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
          <div class="title">Class name</div>
          <div class="subtitle-1">Class description</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" xs="12" class="mx-auto">
          <v-card>
            <v-tabs v-model="tab">
              <v-tab key="details">Details</v-tab>
              <v-tab key="schedule">Schedule</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item key="details">
                <v-card flat>
                  <v-card-text>students and classes</v-card-text>
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
      search: null,
      loading: false,
      saving: false,
      tab: null
    }
  },

  async created() {
    this.orgId = JSON.parse(localStorage.org).id

    const currentClass = await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('classes')
      .doc(this.$route.params.id)
      .get()

    if (!currentClass.empty) {
      const data = currentClass.data()
      console.log(data)
    }
  }
}
</script>
