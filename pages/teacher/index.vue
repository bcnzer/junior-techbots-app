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
    <v-row v-if="!loading && !classCreated">
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
              As a first step we need to create a class, after which we'll be
              able to invite students to join
            </div>
          </v-flex>
          <v-flex xs12>
            <v-btn @click="showAddEdit = true" x-large class="primary mt-5">
              Create a class
            </v-btn>
            <add-edit-class
              :show="showAddEdit"
              :id="dialogAddEditClassId"
              :class-name="dialogAddEditName"
              :class-description="dialogAddEditDescription"
              @onSave="addEditClass"
              @onClose="closeAddEditClass"
            ></add-edit-class>
          </v-flex>
        </v-layout>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import AddEditClass from '@/components/teacher/AddEditClass'

export default {
  layout: 'teacher',

  components: {
    AddEditClass
  },

  head() {
    return { title: 'Teacher' }
  },

  data() {
    return {
      loading: true,
      orgId: null,
      classCreated: false,
      dialogAddEditClassId: null,
      dialogAddEditName: null,
      dialogAddEditDescription: null,
      showAddEdit: false
    }
  },

  async created() {
    this.orgId = JSON.parse(localStorage.org).id

    const classes = await firestore
      .collection('organizations')
      .doc(this.orgId)
      .collection('classes')
      .get()

    this.classCreated = classes.docs.length > 0
    if (this.classCreated) {
      // This screen serves only as a welcome screen to first-time users
      this.$router.push('/teacher/classes')
    }
    localStorage.classCreated = this.classCreated

    this.loading = false
  },

  methods: {
    async addEditClass(addedClass) {
      this.showAddEdit = false
      delete addedClass.id
      console.log(addedClass)

      await firestore
        .collection('organizations')
        .doc(this.orgId)
        .collection('classes')
        .add(addedClass)

      this.dialogAddEditClassId = null
      this.dialogAddEditName = null
      this.dialogAddEditDescription = null
      this.$router.push('/teacher/classes')
    },
    closeAddEditClass() {
      // All we're doing is closing the window as the person pressed cancel
      console.log('closeAddEditClass')
      this.dialogAddEditClassId = null
      this.dialogAddEditName = ''
      this.dialogAddEditDescription = ''
      this.showAddEdit = false
    }
  }
}
</script>
