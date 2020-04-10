<template>
  <lesson :lessonId="$route.params.id"></lesson>
</template>

<script>
import lesson from '~/components/lesson'

export default {
  layout: 'teacher',

  components: {
    lesson
  },

  head() {
    return { title: 'Lesson' }
  }
}
</script>
