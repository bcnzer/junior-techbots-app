<template>
  <v-row class="fill-height mt-2 ml-1">
    <v-col>
      <v-btn @click="showDialog = true" class="primary"
        >Schedule a Lesson</v-btn
      >
      <div v-if="groupLessons.length <= 0" class="body-1 mt-4 mb-2">
        Go ahead and schedule some lessons 😊
      </div>
      <v-data-table
        v-else
        :headers="headers"
        :items="lessons"
        @click:row="showScheduledGroup"
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
                  </v-col>
                  <v-col cols="12" xs="12" sm="4">
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
                  </v-col>
                  <v-col cols="12" xs="12" sm="4">
                    <v-select
                      :items="durations"
                      label="Duration (minutes)"
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-textarea label="Notes" value=""></v-textarea>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions class="mb-3 mr-3">
              <v-spacer></v-spacer>
              <v-btn @click="showDialog = false" :disabled="saving"
                >Cancel</v-btn
              >
              <v-btn
                @click="saveScheduledGroup()"
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
  name: 'GroupSchedule',

  props: {
    lessons: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      saving: null,
      showDialog: false,
      groupLessons: [],
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' }
      ],
      durations: [
        5,
        10,
        15,
        20,
        25,
        30,
        35,
        40,
        45,
        50,
        55,
        60,
        65,
        70,
        75,
        80,
        85,
        90,
        95,
        100
      ],
      dialogDate: null,
      dialogStartTime: null,
      dialogTimeMenu: null,
      dialogDateMenu: null,
      dialogSelectedLesson: null
    }
  },

  methods: {
    saveScheduledGroup() {
      // TODO
      this.showDialog = false
    },
    showScheduledGroup(scheduledGroup) {
      console.log(scheduledGroup)
      this.showDialog = true
    }
  }
}
</script>
