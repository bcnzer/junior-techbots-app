<template>
  <v-dialog v-model="show" max-width="500px">
    <v-form ref="modalAddEditClass" lazy-validation>
      <v-card>
        <v-card-title>
          <span class="headline">{{ actionType }} Class</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="name"
                  :rules="[(v) => !!v || 'Name is required']"
                  :disabled="saving"
                  label="Name"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="description"
                  :disabled="saving"
                  label="Description"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="btnClick(true)" :loading="saving" color="primary"
            >Save</v-btn
          >
          <v-btn @click="btnClick(false)" :disabled="saving">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
export default {
  name: 'AddEditClass',

  props: {
    className: {
      type: String,
      default: null
    },
    classDescription: {
      type: String,
      default: null
    },
    show: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      internalName: null,
      internalDescription: null,
      saving: false
    }
  },

  computed: {
    actionType() {
      return !this.id ? 'Add' : 'Edit'
    },
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
      // Note that closing of the dialog is done by the component that called
      // the dialog so they must listen to both events below
      this.saving = false
      if (save && (!this.internalName || !this.internalDescription)) {
        const updatedClass = { id: this.id }
        if (this.internalName) {
          updatedClass.name = this.internalName
        }
        if (this.internalDescription) {
          updatedClass.description = this.internalDescription
        }
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
