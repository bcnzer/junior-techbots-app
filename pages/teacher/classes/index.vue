<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="table" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-alert v-if="classes.length == 0" type="warning">
          You must have at least one class defined
        </v-alert>
        <v-data-table :headers="headers" :items="classes">
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Classes</v-toolbar-title>
              <v-spacer></v-spacer>

              <v-btn @click="showAddEdit = true">Add Class</v-btn>
              <add-edit-class
                :show="showAddEdit"
                :id="dialogAddEditClassId"
                :class-name="dialogAddEditName"
                :class-description="dialogAddEditDescription"
                @onSave="addEditClass"
                @onClose="closeAddEditClass"
              ></add-edit-class>
              <!-- <v-btn @click="showDi = true">Add Class</v-btn> -->
            </v-toolbar>
          </template>

          <template slot="no-data">
            No classes exist. You must have at least one class
          </template>

          <template v-slot:item.action="{ item }">
            <v-icon @click="showEditClass(item)" small class="mr-3">
              mdi-pencil
            </v-icon>
            <v-icon @click="showConfirmationToDelete(item)" small>
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-col>
      <snackbar />
      <confirmation-dialog
        :showDialog="showConfirmationDialog"
        @on-dialog-confirmation="onConfirmation()"
        @on-dialog-cancel="onCancel()"
        :id="classToRemoveId"
        :text="confirmationDialogMessage"
        title="Delete Class?"
      />
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import snackbar from '@/components/snackbar'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import AddEditClass from '@/components/teacher/AddEditClass'

export default {
  layout: 'teacher',

  components: {
    snackbar,
    ConfirmationDialog,
    AddEditClass
  },

  head() {
    return { title: 'Classes' }
  },

  data() {
    return {
      orgId: null,
      dialogAddEditClassId: null,
      dialogAddEditName: null,
      dialogAddEditDescription: null,
      showAddEdit: false,
      classToRemoveId: null,
      classToRemoveName: null,

      showConfirmationDialog: false,
      valid: false,
      loading: true,
      saving: false,
      dialogEmail: null,
      dialogEmailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      showSnackbar: false,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      classes: []
    }
  },

  computed: {
    confirmationDialogMessage() {
      return `Are you want to delete '${this.classToRemoveName}'?`
    }
  },

  async created() {
    this.orgId = JSON.parse(localStorage.org).id

    await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('classes')
      .orderBy('name')
      .onSnapshot((querySnapshot) => {
        this.classes = []
        querySnapshot.docs.forEach((doc) => {
          const record = doc.data()
          record.id = doc.id
          this.classes.push(record)
        })
        this.loading = false
      })
  },

  methods: {
    closeAddEditClass() {
      // All we're doing is closing the window as the person pressed cancel
      this.showAddEdit = false
    },
    async addEditClass(addedClass) {
      this.showAddEdit = false

      if (!addedClass.id) {
        await firestore
          .collection('organizations')
          .doc(this.orgId)
          .collection('classes')
          .add({
            name: addedClass.name,
            description: addedClass.description
          })
      } else {
        await firestore
          .collection('organizations')
          .doc(this.orgId)
          .collection('classes')
          .doc(addedClass.id)
          .update({
            name: addedClass.name,
            description: addedClass.description
          })
      }

      this.dialogAddEditClassId = null
      this.dialogAddEditName = null
      this.dialogAddEditDescription = null
      this.$store.commit(
        'snackbar/setSnack',
        `Class ${addedClass.id == null ? 'added' : 'updated'}`
      )
    },
    async onConfirmation() {
      // Delete the student in question
      this.showConfirmationDialog = false

      await firestore
        .collection('organizations')
        .doc(this.orgId)
        .collection('classes')
        .doc(this.classToRemoveId)
        .delete()

      this.classToRemoveId = null
      this.classToRemoveName = null
    },
    onCancel() {
      this.showConfirmationDialog = false
    },
    showEditClass(item) {
      this.dialogAddEditClassId = item.id
      this.dialogAddEditName = item.name
      this.dialogAddEditDescription = item.description
      this.showAddEdit = true
    },
    showConfirmationToDelete(item) {
      this.classToRemoveId = item.id
      this.classToRemoveName = item.name
      this.showConfirmationDialog = true
    }
  }
}
</script>
