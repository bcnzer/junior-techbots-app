<template>
  <div>
    <v-btn @click="showStudentDialog()" class="primary mx-right"
      >Add Students</v-btn
    >

    <v-list two-line>
      <template v-for="(student, index) in selectedStudents">
        <v-divider
          v-if="showDivider(index, students.length)"
          :key="index"
        ></v-divider>

        <v-list-item :key="student.id">
          <v-list-item-avatar>
            <v-img :src="student.photoURL"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-html="student.displayName"></v-list-item-title>
            <v-list-item-subtitle v-html="student.email"></v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn text icon>
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn text icon>
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>

    <v-dialog v-model="showDialog" persistent scrollable max-width="750px">
      <v-form ref="modalStudents" lazy-validation>
        <v-card>
          <v-card-title>
            Students
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-divider></v-divider>
              <template v-for="student in dialogStudents">
                <v-list-item :key="student.id" v-show="showStudent(student)">
                  <v-list-item-action>
                    <v-checkbox v-model="student.selected"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-avatar class="mr-5">
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
                <v-divider></v-divider>
              </template>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="saveSelectedStudents()"
              :loading="saving"
              color="primary"
              >Save</v-btn
            >
            <v-btn @click="showDialog = false" :disabled="saving">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'ClassStudents',

  props: {
    students: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      search: null,
      showDialog: false,
      saving: false,
      dialogStudents: []
    }
  },

  computed: {
    selectedStudents() {
      return this.students.filter((student) => {
        return student.selected === true
      })
    }
  },

  methods: {
    showStudent(student) {
      // Based on the search, show the student... or not
      if (!this.search) return true

      const searchLowercase = this.search.toLowerCase()
      return (
        student.displayName.toLowerCase().includes(searchLowercase) ||
        student.email.toLowerCase().includes(searchLowercase)
      )
    },
    showDivider(index, length) {
      if (index <= 0) return false
      if (index < length) return true
      return false
    },
    showStudentDialog() {
      // Clone the array. That way each time you open the dialog we won't display
      // the previously selected students
      this.search = null
      this.dialogStudents = JSON.parse(JSON.stringify(this.students))
      this.showDialog = true
    },
    saveSelectedStudents() {
      this.$emit('save-selected-students', this.dialogStudents)
      this.showDialog = false
    }
  }
}
</script>
