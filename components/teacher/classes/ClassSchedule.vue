<template>
  <v-row class="fill-height">
    <v-col>
      <v-btn @click="showDialog = true" class="primary mt-2 ml-3"
        >Schedule a Lesson</v-btn
      >
      <v-data-table
        :headers="headers"
        :items="lessons"
        @click:row="showScheduledClass"
        class="mx-3"
      >
        <template v-slot:item.action="{ item }">
          <v-icon @click="editLesson(item)" small class="mr-3">
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>

      <v-dialog v-model="showDialog" scrollable max-width="600px">
        <v-form ref="modalStudents" lazy-validation>
          <v-card>
            <v-card-title>
              Schedule a Lesson
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-combobox
                    v-model="dialogSelectedLesson"
                    :items="lessons"
                    :disabled="saving"
                    label="Lesson"
                  ></v-combobox>
                </v-row>
                <v-row>
                  <v-menu
                    ref="dialogDateMenu"
                    v-model="dialogDateMenu"
                    :close-on-content-click="false"
                    :return-value.sync="dialogDate"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="dialogDate"
                        v-on="on"
                        label="Date"
                        class="mr-1"
                        readonly
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="dialogDate" no-title scrollable>
                      <v-spacer></v-spacer>
                      <v-btn
                        @click="dialogDateMenu = false"
                        text
                        color="primary"
                        >Cancel</v-btn
                      >
                      <v-btn
                        @click="$refs.dialogDateMenu.save(dialogDate)"
                        text
                        color="primary"
                        >OK</v-btn
                      >
                    </v-date-picker>
                  </v-menu>
                  <v-menu
                    ref="dialogTimeMenu"
                    v-model="dialogTimeMenu"
                    :close-on-content-click="false"
                    :return-value.sync="dialogStartTime"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="dialogStartTime"
                        v-on="on"
                        label="Start Time"
                        class="mx-1"
                        readonly
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-model="dialogStartTime"
                      :ampm-in-title="true"
                      full-width
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        @click="dialogTimeMenu = false"
                        text
                        color="primary"
                        >Cancel</v-btn
                      >
                      <v-btn
                        @click="$refs.dialogTimeMenu.save(dialogStartTime)"
                        text
                        color="primary"
                        >OK</v-btn
                      >
                    </v-time-picker>
                  </v-menu>
                </v-row>

                <v-row>
                  <v-textarea label="Notes" value=""></v-textarea>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="showDialog = false" :disabled="saving"
                >Cancel</v-btn
              >
              <v-btn
                @click="saveScheduledClass()"
                :loading="saving"
                color="primary"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'ClassSchedule',

  props: {
    schedule: {
      type: Array,
      default: () => []
    },
    lessons: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      saving: null,
      showDialog: false,
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' }
      ],
      dialogDate: null,
      dialogStartTime: null,
      dialogTimeMenu: null,
      dialogDateMenu: null,
      dialogSelectedLesson: null
    }
  },

  methods: {
    addLesson() {
      this.showDialog = true
    },
    saveScheduledClass() {
      // TODO
      this.showDialog = false
    },
    showScheduledClass(scheduledClass) {
      console.log(scheduledClass)
      this.showDialog = true
    }
  }
}
</script>
