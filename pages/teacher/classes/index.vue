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
        <v-card>
          <v-card-title>
            Classes
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
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="classes"
            @click:row="showEditClass"
          >
            <template slot="no-data">
              No classes exist. You must have at least one class
            </template>
          </v-data-table>
        </v-card>
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
        { text: 'Description', value: 'description' }
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
      this.dialogAddEditClassId = null
      this.dialogAddEditName = null
      this.dialogAddEditDescription = null
      this.showAddEdit = false
    },
    async addEditClass(addedClass) {
      this.showAddEdit = false

      const id = addedClass.id
      delete addedClass.id

      if (!id) {
        await firestore
          .collection('organizations')
          .doc(this.orgId)
          .collection('classes')
          .add(addedClass)
      } else {
        await firestore
          .collection('organizations')
          .doc(this.orgId)
          .collection('classes')
          .doc(id)
          .update(addedClass)
      }

      this.dialogAddEditClassId = null
      this.dialogAddEditName = null
      this.dialogAddEditDescription = null
      this.$store.commit(
        'snackbar/setSnack',
        `Class ${id == null ? 'added' : 'updated'}`
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
      console.log(item)
      this.$router.push(`/teacher/classes/${item.id}`)
      // this.dialogAddEditClassId = item.id
      // this.dialogAddEditName = item.name
      // this.dialogAddEditDescription = item.description
      // this.showAddEdit = true
    },
    showConfirmationToDelete(item) {
      this.classToRemoveId = item.id
      this.classToRemoveName = item.name
      this.showConfirmationDialog = true
    }
  }
}
</script>
