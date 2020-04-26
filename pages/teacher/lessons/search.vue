<template>
  <div>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader
          type="card article"
          min-width="300"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-card>
          <v-card-title>
            Import Lessons
            <v-spacer />
            <ais-powered-by />
          </v-card-title>
          <div class="mx-4">
            <ais-instant-search
              :search-client="searchClient"
              index-name="staging_lessons"
            >
              <ais-search-box>
                <v-text-field
                  slot-scope="{ currentRefinement, isSearchStalled, refine }"
                  v-model="currentRefinement"
                  @input="refine(currentRefinement)"
                  :loading="isSearchStalled"
                  :placeholder="searchPlaceholder(isSearchStalled)"
                  outlined
                  single-line
                ></v-text-field>
              </ais-search-box>
              <v-row>
                <v-col cols="12" xs="12" sm="5" md="3">
                  <div class="mb-3">
                    <div class="subtitle mb-1">Categories</div>
                    <ais-refinement-list attribute="category" />
                  </div>
                  <div class="mb-3">
                    <div class="subtitle mb-1">Sources</div>
                    <ais-refinement-list attribute="source" />
                  </div>
                </v-col>
                <v-col>
                  <ais-hits>
                    <div slot-scope="{ items }">
                      <v-card
                        v-for="searchResult in items"
                        :key="searchResult.objectID"
                        max-width="700"
                        class="my-3 mx-3"
                      >
                        <v-alert
                          v-if="alreadyAdded(searchResult.objectID)"
                          type="warning"
                          dense
                          class="mb-1"
                          >Lesson has been previously imported</v-alert
                        >
                        <v-row>
                          <v-col
                            v-if="$vuetify.breakpoint.smAndDown"
                            cols="12"
                            xs="12"
                          >
                            <v-lazy>
                              <v-img
                                :src="searchResult.imageUrl"
                                width="256"
                                height="192"
                                class="mx-auto"
                              >
                              </v-img>
                            </v-lazy>
                          </v-col>
                          <v-col cols="12" xs="12" sm="12" md="6">
                            <v-card-title>
                              <ais-highlight
                                :hit="searchResult"
                                attribute="name"
                              />
                            </v-card-title>

                            <v-card-subtitle>
                              <ais-highlight
                                :hit="searchResult"
                                attribute="description"
                              />
                            </v-card-subtitle>

                            <v-card-text class="text--primary">
                              <div>Category: {{ searchResult.category }}</div>
                              <div>Language: {{ searchResult.language }}</div>
                            </v-card-text>

                            <v-card-actions>
                              <v-btn
                                @click="importLesson(searchResult)"
                                :loading="
                                  searchResult.objectID == currentlyImportingId
                                "
                                color="secondary"
                                text
                              >
                                Import
                              </v-btn>
                            </v-card-actions>
                          </v-col>
                          <v-col
                            v-if="$vuetify.breakpoint.mdAndUp"
                            cols="12"
                            xs="12"
                            sm="12"
                            md="6"
                          >
                            <v-lazy>
                              <v-img
                                :src="searchResult.imageUrl"
                                width="256"
                                height="192"
                                class="mx-auto"
                              >
                              </v-img>
                            </v-lazy>
                          </v-col>
                        </v-row>
                      </v-card>
                    </div>
                  </ais-hits>
                </v-col>
              </v-row>
            </ais-instant-search>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import {
  AisInstantSearch,
  AisHits,
  AisSearchBox,
  AisPoweredBy,
  AisHighlight,
  AisRefinementList
} from 'vue-instantsearch'
import algoliasearch from 'algoliasearch/lite'
import 'instantsearch.css/themes/algolia-min.css'

export default {
  layout: 'teacher',

  components: {
    AisInstantSearch,
    AisHits,
    AisSearchBox,
    AisPoweredBy,
    AisHighlight,
    AisRefinementList
  },

  data() {
    return {
      loading: true,
      clubId: null,
      currentlyImportingId: null,
      allLessonsInClub: [],
      addedLessons: ['AvxymQflkVHfxJsVcQVX', '1A408Gb4FohcZUAKcWhQ'],
      searchClient: algoliasearch(
        '015VVLILFS',
        '7b8e007e6ec476280da83d4885be3516'
      )
    }
  },

  async created() {
    this.clubId = JSON.parse(localStorage.club).id

    const readLessons = await firestore
      .collection('clubs')
      .doc(this.clubId)
      .collection('lessons')
      .get()

    if (!readLessons.empty) {
      readLessons.docs.forEach((lesson) => {
        const lessonData = lesson.data()
        if (lessonData.importId) {
          this.allLessonsInClub.push(lessonData.importId)
        }
      })
    }

    this.loading = false
  },

  methods: {
    alreadyAdded(searchResultId) {
      return this.allLessonsInClub.includes(searchResultId)
    },
    searchPlaceholder(isSearchStalled) {
      return isSearchStalled ? 'Loading...' : 'Search'
    },
    storeItems(allItems) {
      this.currentSearchResults = allItems
      return 'got it'
    },
    async importLesson(lesson) {
      // Get the full record from the public lessons
      this.currentlyImportingId = lesson.objectID
      const originalLesson = await firestore
        .collection('publiclessons')
        .doc(lesson.objectID)
        .get()

      // Add the record to the club's record but make sure to record where we got it from
      const originalLessonData = originalLesson.data()
      originalLessonData.importId = lesson.objectID

      const addedLesson = await firestore
        .collection('clubs')
        .doc(this.clubId)
        .collection('lessons')
        .add(originalLessonData)

      this.allLessonsInClub.push(addedLesson.id)
      this.currentlyImportingId = null
    }
  }
}
</script>
