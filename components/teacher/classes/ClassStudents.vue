<template>
  <div>
    <v-btn @click="showDialog = true" class="mx-right"
      >Add Students to Class</v-btn
    >

    <v-list two-line>
      <template v-for="(student, index) in students">
        <v-divider
          v-if="showDivider(index, students.length)"
          :key="index"
        ></v-divider>

        <v-list-item :key="student.id" @click="">
          <v-list-item-avatar>
            <v-img :src="student.photoURL"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-html="student.displayName"></v-list-item-title>
            <v-list-item-subtitle v-html="student.email"></v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn text icon>
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action>
            <v-btn text icon>
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>

    <v-dialog v-model="showDialog" scrollable max-width="750px">
      <v-form ref="modalStudents" lazy-validation>
        <v-card>
          <v-card-title>
            Students
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-divider></v-divider>
              <template v-for="student in students">
                <v-list-item :key="student.id" @click="">
                  <v-list-item-action>
                    <v-checkbox v-model="student.selected"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-avatar class="mr-5">
                    <v-img :src="student.photoURL"></v-img>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title
                      v-html="student.displayName"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      v-html="student.email"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
              </template>
            </v-list>
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
  </div>
</template>

<script>
export default {
  name: 'ClassStudents',

  props: {
    students: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      search: null,
      showDialog: false,
      saving: false
    }
  },

  computed: {
    actionType() {
      return !this.id ? 'Add' : 'Edit'
    }
  },

  methods: {
    showDivider(index, length) {
      if (index <= 0) return false
      if (index < length) return true
      return false
    },
    btnClick(save) {
      // if (save && !this.$refs.modalAddEditClass.validate()) {
      //   return
      // }
      // // Note that closing of the dialog is done by the component that called
      // // the dialog so they must listen to both events below
      // this.saving = false
      // if (save && (!this.internalName || !this.internalDescription)) {
      //   const updatedClass = { id: this.id }
      //   if (this.internalName) {
      //     updatedClass.name = this.internalName
      //   }
      //   if (this.internalDescription) {
      //     updatedClass.description = this.internalDescription
      //   }
      //   console.log(updatedClass)
      //   this.$emit('onSave', updatedClass)
      // } else {
      //   this.$emit('onClose')
      // }
      // this.internalName = null
      // this.internalDescription = null
    }
  }
}
</script>
