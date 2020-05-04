<template>
  <scheduled-lesson></scheduled-lesson>
</template>

<script>
import ScheduledLesson from '~/components/teacher/groups/schedule/ScheduledLesson'

export default {
  layout: 'teacher',

  components: {
    ScheduledLesson
  },

  head() {
    return { title: 'Schedule a Lesson' }
  }
}
</script>
