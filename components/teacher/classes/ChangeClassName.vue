<template>
  <v-form ref="modalAddEditClass" lazy-validation>
    <v-row>
      <v-col>
        <v-text-field
          v-model="name"
          :rules="[(v) => !!v || 'Name is required']"
          :disabled="saving"
          label="Class name"
        ></v-text-field>
        <v-text-field
          v-model="description"
          :disabled="saving"
          label="Class description"
        ></v-text-field>
      </v-col>
      <v-col class="mt-3">
        <v-btn
          @click="btnClick(true)"
          :loading="saving"
          :disabled="saving"
          class="primary"
          >Save</v-btn
        >
        <v-btn @click="btnClick(false)" :disabled="saving" class="ml-1"
          >Cancel</v-btn
        >
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  name: 'ChangeClassName',

  props: {
    className: {
      type: String,
      default: null
    },
    classDescription: {
      type: String,
      default: null
    },
    saving: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      internalName: null,
      internalDescription: null
    }
  },

  computed: {
    name: {
      get() {
        return this.className
      },
      set(value) {
        this.internalName = value
      }
    },
    description: {
      get() {
        return this.classDescription
      },
      set(value) {
        this.internalDescription = value
      }
    }
  },

  methods: {
    btnClick(save) {
      if (save && !this.$refs.modalAddEditClass.validate()) {
        return
      }
      if (save) {
        const updatedClass = {}
        updatedClass.name = this.internalName
          ? this.internalName
          : this.className
        updatedClass.description = this.internalDescription
          ? this.internalDescription
          : this.classDescription
        this.$emit('onSave', updatedClass)
      } else {
        this.$emit('onClose')
      }
      this.internalName = null
      this.internalDescription = null
    }
  }
}
</script>
