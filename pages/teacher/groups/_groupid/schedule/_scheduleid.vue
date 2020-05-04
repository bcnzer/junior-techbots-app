<template>
  <div>
    <scheduled-lesson :lessonId="$route.params.scheduleid"></scheduled-lesson>
  </div>
</template>

<script>
import ScheduledLesson from '~/components/teacher/groups/schedule/ScheduledLesson'

export default {
  layout: 'teacher',

  components: {
    ScheduledLesson
  },

  head() {
    return { title: 'Scheduled Lesson' }
  }
}
</script>
