<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader
          type="card"
          class="mx-auto"
          max-width="512"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row v-if="!loading && !groupCreated">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-layout column justify-center align-center>
          <v-flex xs12>
            <div class="text-center my-5">
              <v-img src="/bots/robots small.png"></v-img>
            </div>
          </v-flex>
          <v-flex xs12>
            <div class="headline mb-2">
              Let's get started!
            </div>
          </v-flex>
          <v-flex xs12>
            <div class="body-1">
              As a first step we need to create a group, after which we'll be
              able to invite students to join
            </div>
          </v-flex>
          <v-flex xs12>
            <v-btn @click="showAddEdit = true" x-large class="primary mt-5">
              Create a group
            </v-btn>
            <add-edit-group
              :show="showAddEdit"
              :id="dialogAddEditId"
              :group-name="dialogAddEditName"
              :group-description="dialogAddEditDescription"
              @onSave="addEditGroup"
              @onClose="closeAddEditGroup"
            ></add-edit-group>
          </v-flex>
        </v-layout>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import AddEditGroup from '@/components/teacher/groups/AddEditGroup'

export default {
  layout: 'teacher',

  components: {
    AddEditGroup
  },

  head() {
    return { title: 'Teacher' }
  },

  data() {
    return {
      loading: true,
      orgId: null,
      groupCreated: false,
      dialogAddEditId: null,
      dialogAddEditName: null,
      dialogAddEditDescription: null,
      showAddEdit: false
    }
  },

  async created() {
    this.orgId = JSON.parse(localStorage.org).id

    const groups = await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('groups')
      .get()

    this.groupCreated = groups.docs.length > 0
    if (this.groupCreated) {
      // This screen serves only as a welcome screen to first-time users
      this.$router.push('/teacher/groups')
    }
    localStorage.groupCreated = this.groupCreated

    this.loading = false
  },

  methods: {
    async addEditGroup(addedGroup) {
      this.showAddEdit = false
      delete addedGroup.id

      await firestore
        .collection('organizations')
        .doc(this.orgId)
        .collection('groups')
        .add(addedGroup)

      this.dialogAddEditId = null
      this.dialogAddEditName = null
      this.dialogAddEditDescription = null
      this.$router.push('/teacher/groups')
    },
    closeAddEditGroup() {
      // All we're doing is closing the window as the person pressed cancel
      console.log('closeAddEditGroup')
      this.dialogAddEditId = null
      this.dialogAddEditName = ''
      this.dialogAddEditDescription = ''
      this.showAddEdit = false
    }
  }
}
</script>
