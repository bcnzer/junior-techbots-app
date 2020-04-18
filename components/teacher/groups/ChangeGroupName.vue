<template>
  <v-form ref="modalAddEditGroup" lazy-validation>
    <v-row>
      <v-col cols="12" xs="12" sm="6">
        <v-text-field
          v-model="name"
          :rules="[(v) => !!v || 'Name is required']"
          :disabled="saving"
          label="Group name"
        ></v-text-field>
        <v-text-field
          v-model="description"
          :disabled="saving"
          label="Group description"
        ></v-text-field>
      </v-col>
      <v-col cols="12" xs="12" sm="6" class="my-bottom">
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
  name: 'ChangeGroupName',

  props: {
    groupName: {
      type: String,
      default: null
    },
    groupDescription: {
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
        return this.groupName
      },
      set(value) {
        this.internalName = value
      }
    },
    description: {
      get() {
        return this.groupDescription
      },
      set(value) {
        this.internalDescription = value
      }
    }
  },

  methods: {
    btnClick(save) {
      if (save && !this.$refs.modalAddEditGroup.validate()) {
        return
      }
      if (save) {
        const updatedGroup = {}
        updatedGroup.name = this.internalName
          ? this.internalName
          : this.groupName
        updatedGroup.description = this.internalDescription
          ? this.internalDescription
          : this.groupDescription
        this.$emit('onSave', updatedGroup)
      } else {
        this.$emit('onClose')
      }
      this.internalName = null
      this.internalDescription = null
    }
  }
}
</script>
