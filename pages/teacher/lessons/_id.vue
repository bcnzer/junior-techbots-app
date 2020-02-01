<template>
  <lesson :lessonId="$route.params.id"></lesson>
</template>

<script>
import lesson from '~/components/lesson'

export default {
  layout: 'teacher',

  head() {
    return { title: 'New Lesson' }
  },

  components: {
    lesson
  }
}
</script>
