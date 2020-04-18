<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="table" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-alert v-if="groups.length == 0" type="warning">
          You must have at least one group defined
        </v-alert>
        <v-card>
          <v-card-title>
            Groups
            <v-spacer></v-spacer>
            <v-btn @click="showAddEdit = true" class="primary">Add Group</v-btn>
            <add-edit-group
              :show="showAddEdit"
              :id="dialogId"
              :group-name="dialogName"
              :group-description="dialogDescription"
              @onSave="onAddEditGroup"
              @onClose="onCloseGroup"
            ></add-edit-group>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="groups"
            @click:row="showEditGroup"
          >
            <template slot="no-data">
              No groups exist. You must have at least one group
            </template>

            <template v-slot:item.action="{ item }">
              <v-icon @click="showEditGroup(item)" class="mr-3">
                mdi-pencil
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <snackbar />
      <confirmation-dialog
        :showDialog="showConfirmationDialog"
        @on-dialog-confirmation="onConfirmation()"
        @on-dialog-cancel="onCancel()"
        :id="groupToRemoveId"
        :text="confirmationDialogMessage"
        title="Delete Group?"
      />
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import snackbar from '@/components/snackbar'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import AddEditGroup from '@/components/teacher/groups/AddEditGroup'

export default {
  layout: 'teacher',

  components: {
    snackbar,
    ConfirmationDialog,
    AddEditGroup
  },

  head() {
    return { title: 'Groups' }
  },

  data() {
    return {
      clubId: null,
      dialogId: null,
      dialogName: null,
      dialogDescription: null,
      showAddEdit: false,
      groupToRemoveId: null,
      groupToRemoveName: null,

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
        { text: '', value: 'edit' }
      ],
      groups: []
    }
  },

  computed: {
    confirmationDialogMessage() {
      return `Are you want to delete '${this.groupToRemoveName}'?`
    }
  },

  async created() {
    this.clubId = JSON.parse(localStorage.club).id

    await firestore
      .collection('clubs')
      .doc(this.clubId)
      .collection('groups')
      .orderBy('name')
      .onSnapshot((querySnapshot) => {
        this.groups = []
        querySnapshot.docs.forEach((doc) => {
          const record = doc.data()
          record.id = doc.id
          this.groups.push(record)
        })
        this.loading = false
      })
  },

  methods: {
    onCloseGroup() {
      // All we're doing is closing the window as the person pressed cancel
      this.dialogId = null
      this.dialogName = null
      this.dialogDescription = null
      this.showAddEdit = false
    },
    async onAddEditGroup(addedGroup) {
      this.showAddEdit = false

      const id = addedGroup.id
      delete addedGroup.id

      if (!id) {
        await firestore
          .collection('clubs')
          .doc(this.clubId)
          .collection('groups')
          .add(addedGroup)
      } else {
        await firestore
          .collection('clubs')
          .doc(this.clubId)
          .collection('groups')
          .doc(id)
          .update(addedGroup)
      }

      this.dialogId = null
      this.dialogName = null
      this.dialogDescription = null
      this.$store.commit(
        'snackbar/setSnack',
        `Group ${id == null ? 'added' : 'updated'}`
      )
    },
    async onConfirmation() {
      // Delete the student in question
      this.showConfirmationDialog = false

      await firestore
        .collection('clubs')
        .doc(this.clubId)
        .collection('groups')
        .doc(this.groupToRemoveId)
        .delete()

      this.groupToRemoveId = null
      this.groupToRemoveName = null
    },
    onCancel() {
      this.showConfirmationDialog = false
    },
    showEditGroup(item) {
      console.log(item)
      this.$router.push(`/teacher/groups/${item.id}`)
      // this.dialogId = item.id
      // this.dialogName = item.name
      // this.dialogDescription = item.description
      // this.showAddEdit = true
    },
    showConfirmationToDelete(item) {
      this.groupToRemoveId = item.id
      this.groupToRemoveName = item.name
      this.showConfirmationDialog = true
    }
  }
}
</script>
