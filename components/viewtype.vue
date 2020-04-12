<template>
  <v-hover v-slot:default="{ hover }">
    <v-card :elevation="hover ? 16 : 4" class="mx-auto py-2" max-width="300">
      <v-img
        :src="image"
        aspect-ratio="1"
        max-width="200"
        max-height="200"
        class="mx-auto"
      ></v-img>

      <v-card-actions>
        <v-btn
          :disabled="disabled"
          @click="click()"
          color="primary"
          class="mx-auto"
          large
        >
          {{ buttonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>

<script>
export default {
  name: 'ViewType',

  props: {
    image: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: null
    }
  },

  methods: {
    click() {
      this.$emit('card-clicked')
    }
  }
}
</script>
