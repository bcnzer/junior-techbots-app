<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn @click="setToday" outlined class="mr-4" color="grey darken-2">
            Today
          </v-btn>
          <v-btn @click="prev" fab text small color="grey darken-2">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn @click="next" fab text small color="grey darken-2">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn @click="addLesson" outlined class="mr-4" color="grey darken-2">
            Add Lesson
          </v-btn>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" outlined color="grey darken-2">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          :events="events"
          :event-color="getEventColor"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click.time="clickTime"
          @click:more="viewDay"
          @click:date="viewDay"
          @click:day="clickDay"
          @click:interval="clickInterval"
          @change="updateRange"
          color="primary"
        ></v-calendar>
      </v-sheet>

      <v-dialog v-model="showDialog" scrollable max-width="600px">
        <v-form ref="modalStudents" lazy-validation>
          <v-card>
            <v-card-title>
              Scheduled Lesson
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-combobox
                    v-model="selectedLesson"
                    :items="lessons"
                    :disabled="saving"
                    label="Lesson"
                  ></v-combobox>
                </v-row>
                <v-row>
                  <v-menu
                    ref="startDateMenu"
                    v-model="startDateMenu"
                    :close-on-content-click="false"
                    :return-value.sync="startDate"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="startDate"
                        v-on="on"
                        label="Start Date"
                        prepend-icon="mdi-calendar"
                        class="mr-1"
                        readonly
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="startDate"
                      @click:minute="$refs.startDateMenu.save(startDate)"
                      no-title
                      scrollable
                    >
                    </v-date-picker>
                  </v-menu>
                  <v-menu
                    ref="startTimeMenu"
                    v-model="startTimeMenu"
                    :close-on-content-click="false"
                    :return-value.sync="startTime"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="startTime"
                        v-on="on"
                        label="Start Time"
                        class="mx-1"
                        readonly
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-model="startTime"
                      :ampm-in-title="true"
                      full-width
                    >
                      <v-spacer></v-spacer>
                      <v-btn @click="startTimeMenu = false" text color="primary"
                        >Cancel</v-btn
                      >
                      <v-btn
                        @click="$refs.startTimeMenu.save(startTime)"
                        text
                        color="primary"
                        >OK</v-btn
                      >
                    </v-time-picker>
                  </v-menu>
                </v-row>
                <v-row>
                  <v-menu
                    ref="endDateMenu"
                    v-model="endDateMenu"
                    :close-on-content-click="false"
                    :return-value.sync="startDate"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="endDate"
                        v-on="on"
                        label="End Date"
                        prepend-icon="mdi-calendar"
                        class="mr-1"
                        readonly
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="endDate" no-title scrollable>
                      <v-spacer></v-spacer>
                      <v-btn @click="endDateMenu = false" text color="primary"
                        >Cancel</v-btn
                      >
                      <v-btn
                        @click="$refs.endDateMenu.save(endDate)"
                        text
                        color="primary"
                        >OK</v-btn
                      >
                    </v-date-picker>
                  </v-menu>
                  <v-menu
                    ref="endTimeMenu"
                    v-model="endTimeMenu"
                    :close-on-content-click="false"
                    :return-value.sync="startTime"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="endTime"
                        v-on="on"
                        label="End Time"
                        class="ml-1"
                        readonly
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-model="endTime"
                      :ampm-in-title="true"
                      full-width
                    >
                      <v-spacer></v-spacer>
                      <v-btn @click="endTimeMenu = false" text color="primary"
                        >Cancel</v-btn
                      >
                      <v-btn
                        @click="$refs.endTimeMenu.save(endTime)"
                        text
                        color="primary"
                        >OK</v-btn
                      >
                    </v-time-picker>
                  </v-menu>
                </v-row>

                <v-textarea label="Notes" value=""></v-textarea>
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
      type: 'month',
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        '4day': '4 Days'
      },
      start: null,
      end: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      focus: '',
      today: null,
      startDateMenu: null,
      startDate: null,
      endDateMenu: null,
      endDate: null,
      startTimeMenu: null,
      startTime: null,
      endTimeMenu: null,
      endTime: null,
      selectedLesson: null
    }
  },

  computed: {
    title() {
      const { start, end } = this
      if (!start || !end) {
        return ''
      }

      const startMonth = this.monthFormatter(start)
      const endMonth = this.monthFormatter(end)
      const suffixMonth = startMonth === endMonth ? '' : endMonth

      const startYear = start.year
      const endYear = end.year
      const suffixYear = startYear === endYear ? '' : endYear

      const startDay = start.day + this.nth(start.day)
      const endDay = end.day + this.nth(end.day)

      switch (this.type) {
        case 'month':
          return `${startMonth} ${startYear}`
        case 'week':
        case '4day':
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
        case 'day':
          return `${startMonth} ${startDay} ${startYear}`
      }
      return ''
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: 'UTC',
        month: 'long'
      })
    }
  },

  mounted() {
    this.$refs.calendar.checkChange()
  },

  methods: {
    addLesson() {
      this.showDialog = true
    },
    saveScheduledClass() {
      // TODO
      this.showDialog = false
    },
    showEvent({ nativeEvent, event }) {
      console.log('showEvent')
      console.log(event)
      this.showDialog = true
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        setTimeout(() => (this.selectedOpen = true), 10)
      }

      if (this.selectedOpen) {
        this.selectedOpen = false
        setTimeout(open, 10)
      } else {
        open()
      }

      nativeEvent.stopPropagation()
    },
    prev() {
      this.$refs.calendar.prev()
    },
    next() {
      this.$refs.calendar.next()
    },
    clickDay() {
      console.log('click day')
    },
    updateRange({ start, end }) {
      //   events.push({
      //     name: this.names[this.rnd(0, this.names.length - 1)],
      //     start: this.formatDate(first, !allDay),
      //     end: this.formatDate(second, !allDay),
      //     color: this.colors[this.rnd(0, this.colors.length - 1)]
      //   })

      this.events.push({
        name: 'Hello world',
        start: this.formatDate(new Date(`2020-03-08T11:00:00`), false),
        end: this.formatDate(new Date(`2020-03-08T11:00:00`), false),
        color: 'blue'
      })
      this.start = start
      this.end = end
    },
    nth(d) {
      return d > 3 && d < 21
        ? 'th'
        : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a
    },
    formatDate(a, withTime) {
      return withTime
        ? `${a.getFullYear()}-${a.getMonth() +
            1}-${a.getDate()} ${a.getHours()}:${a.getMinutes()}`
        : `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()}`
    },
    getEventColor(event) {
      // TODO
      return 'blue'
    },
    setToday() {
      this.focus = this.today
    },
    viewDay({ date }) {
      this.focus = date
      this.type = 'day'
      console.log('view day')
    },
    onMouseDown(event) {
      console.log('onMouseDown')
      console.log(event)

      this.showDialog = true
    },
    clickInterval() {
      console.log('clickInterval')
    },
    clickTime() {
      console.log('clickTime')
    }
  }
}
</script>
