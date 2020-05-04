<template>
  <v-row class="fill-height mt-2 ml-1">
    <v-col>
      <v-btn @click="scheduleLesson()" v-if="showScheduleBtn" class="primary"
        >Schedule a Lesson</v-btn
      >
      <div v-if="lessons.length <= 0" class="body-1 mt-4 mb-2">
        Go ahead and schedule some lessons 😊
      </div>
      <v-data-table
        v-else
        :headers="headers"
        :items="lessons"
        @click:row="showDialog = true"
        class="mx-3"
      >
        <template v-slot:item.action="{ item }">
          <v-icon @click="editLesson(item)" small class="mr-3">
            mdi-pencil
          </v-icon>
        </template>
        <template v-slot:item.startDateTime="{ item }">
          {{ item.startDateTime | formatDateTime }}
        </template>
      </v-data-table>
      <!-- 
      <v-dialog v-model="showDialog" scrollable max-width="600px">
        <v-form ref="modalAddLesson" lazy-validation>
          <v-card>
            <v-card-title class="mx-3">
              Schedule a Lesson
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col>
                    <v-combobox
                      v-model="dialogSelectedLesson"
                      :items="lessons"
                      :disabled="saving"
                      label="Lesson"
                    ></v-combobox>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12" xs="12" sm="4">
                    <v-menu
                      ref="dialogDateMenu"
                      v-model="dialogDateMenu"
                      :close-on-content-click="false"
                      :return-value.sync="dialogStartDate"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="dialogStartDate"
                          v-on="on"
                          label="Date"
                          class="mr-1"
                          readonly
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="dialogStartDate"
                        no-title
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          @click="dialogDateMenu = false"
                          text
                          color="primary"
                          >Cancel</v-btn
                        >
                        <v-btn
                          @click="$refs.dialogDateMenu.save(dialogStartDate)"
                          text
                          color="primary"
                          >OK</v-btn
                        >
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" xs="12" sm="4">
                    <v-text-field
                      v-model="dialogStartTime"
                      label="Start Time"
                      type="time"
                      class="ml-2 mr-3"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" xs="12" sm="4">
                    <v-text-field
                      v-model="dialogDuration"
                      label="Duration"
                      type="number"
                      suffix="minutes"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-textarea
                      v-model="dialogNotes"
                      label="Notes"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions class="mb-3 mr-3">
              <v-spacer></v-spacer>
              <v-btn
                @click="saveScheduledLesson()"
                :loading="saving"
                color="primary"
                >Save</v-btn
              >
              <v-btn @click="showDialog = false" :disabled="saving"
                >Cancel</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog> -->
    </v-col>
  </v-row>
</template>

<script>
import date from 'date-and-time'

export default {
  name: 'GroupSchedule',

  filters: {
    formatDateTime(value) {
      if (!value) return ''
      const pattern = date.compile('YYYY-MM-DD h:mm A')
      return date.format(value.toDate(), pattern)
    }
  },

  props: {
    lessons: {
      type: Array,
      default: () => []
    },
    showScheduleBtn: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      saving: null,
      dialogDateMenu: null,
      dialogSelectedLesson: null,
      dialogStartDate: null,
      dialogStartTime: null,
      dialogDuration: null,
      dialogNotes: null,
      headers: [
        { text: 'Date', value: 'startDateTime' },
        { text: 'Name', value: 'lesson.name' },
        { text: 'Category', value: 'lesson.category' }
      ]
    }
  },

  methods: {
    scheduleLesson() {
      this.$router.push(
        `/teacher/groups/${this.$route.params.groupid}/schedule/add`
      )
    }
  }
}
</script>
