<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="table" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <nuxt-link to="/teacher/lessons/add">Add lesson</nuxt-link>
        <v-card>
          <v-card-title>
            Lessons
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
            <v-btn @click="showAddEdit = true" class="mt-3 ml-2"
              >Add Lesson</v-btn
            >
          </v-card-title>
          <v-data-table :headers="headers" :items="lessons" :search="search">
            <template v-slot:item.action="{ item }">
              <v-icon @click="showEditClass(item)" small class="mr-3">
                mdi-pencil
              </v-icon>
              <v-icon @click="showConfirmationToDelete(item)" small>
                mdi-delete
              </v-icon>
            </template></v-data-table
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
export default {
  layout: 'teacher',

  head() {
    return { title: 'Lessons' }
  },

  data() {
    return {
      loading: true,
      search: null,
      lessons: [],
      viewTypes: ['Details', 'Card'],
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' },
        { text: 'Description', value: 'description' },
        { text: 'Actions', value: 'action', sortable: false }
      ]
    }
  },

  async created() {
    this.orgId = JSON.parse(localStorage.org).id

    await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('lessons')
      .orderBy('name')
      .onSnapshot((querySnapshot) => {
        this.lessons = []
        querySnapshot.docs.forEach((doc) => {
          const record = doc.data()
          record.id = doc.id
          this.lessons.push(record)
        })
        this.loading = false
      })
  }
}
</script>
