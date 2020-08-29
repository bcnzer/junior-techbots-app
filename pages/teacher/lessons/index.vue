<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="table" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading">
      <v-spacer />
      <div class="text-center mr-3">
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" color="primary" dark data-cy="addLessonButton">
              Add Lesson
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/teacher/lessons/create">
              <v-list-item-title>Create Lesson</v-list-item-title>
            </v-list-item>
            <v-list-item to="/teacher/lessons/search">
              <v-list-item-title
                >Import Lesson(s) from Library</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-row>
    <v-row v-if="!loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-card>
          <v-card-title>
            <div data-cy="lessonPageTitle">
              Lessons
            </div>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="lessons"
            :search="search"
            @click:row="editLesson"
          >
            <template v-slot:item.action="{ item }">
              <v-icon @click="editLesson(item)" small class="mr-3">
                mdi-pencil
              </v-icon>
            </template>
          </v-data-table>
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
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' },
        { text: 'Description', value: 'description' },
        { text: 'Edit', value: 'action', sortable: false }
      ]
    }
  },

  async created() {
    this.clubId = JSON.parse(localStorage.club).id

    await firestore
      .collection('clubs')
      .doc(this.clubId)
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
  },

  methods: {
    editLesson(item) {
      this.$router.push(`/teacher/lessons/${item.id}`)
    }
  }
}
</script>
