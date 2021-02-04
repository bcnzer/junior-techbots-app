<template>
  <h1>Dance Party</h1>
</template>

<script>
export default {
  name: 'StudentCurrentProject',

  data: () => ({
    formEnabled: true
  }),

  props: {
    project: {
      type: Object,
      default: null
    }
  },

  computed: {
    currentProject: {
      get() {
        return this.project
      }
    }
  }
}
</script>
