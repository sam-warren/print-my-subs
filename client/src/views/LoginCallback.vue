<template>
  <v-container>
    <v-row class="text-center mt-4">
      <v-col></v-col>
      <v-col cols="4">
        <v-img
          :src="require('@/assets/images/material-checkmark.svg')"
          class="my-3"
          contain
          height="100"
        />
        <h1 class="pt-4 display-1 font-weight-medium">
          Nice! You're now linked to Twitch. Head back to the homepage to
          continue setting up!
        </h1>
      </v-col>
      <v-col></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import axios from "axios";
import { Component, Vue } from "vue-property-decorator";
import VueRouter from "vue-router";
import router, { Route } from "vue-router";

@Component({})
export default class LoginCallback extends Vue {
  router = new VueRouter({});

  private mounted() {
    console.log(this.$route.query.code);
    axios({
      url: "http://localhost:5000/get-token?code=" + this.$route.query.code,
      method: "GET"
    }).then(res => {
      console.log("Result of bearer: ", res);
    });
  }
}
</script>
<style lang="scss">
@import "../assets/scss/_variables";
.checkbox {
  color: $twitch_purple !important;
}
</style>
