<template>
  <v-container>
    <LoadingComponent :is-loading="isLoading"></LoadingComponent>
    <v-row v-if="!isLoading" class="text-center mt-4">
      <v-col></v-col>
      <v-col v-if="gotBearer" cols="4">
        <v-img
          :src="require('@/assets/images/material-checkmark.svg')"
          class="my-3"
          contain
          height="100"
        />
        <h1 class="pt-4 display-1 font-weight-medium">
          Nice!
        </h1>
        <h2 class="pt-4 display-0 font-weight-light">
          You're now linked to Twitch. Head back to the homepage to continue
          setting up
        </h2>
      </v-col>
      <v-col v-else cols="4">
        <h1 class="pt-4 display-1 font-weight-medium">
          Uh oh...
        </h1>
        <h2 class="pt-4 display-0 font-weight-light">
          Something went wrong trying to connect you to Twitch. Please head back
          to the homepage and click "Authenticate" again.
        </h2>
      </v-col>
      <v-col></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import axios from "axios";
import { Component, Vue } from "vue-property-decorator";
import VueRouter from "vue-router";
import LoadingComponent from "../components/Loading.vue";

@Component({
  components: {
    LoadingComponent: LoadingComponent
  }
})
export default class LoginCallback extends Vue {
  private router = new VueRouter({});
  private gotBearer = false;
  private isLoading = true;

  /*  
      mounted
      Sends the code to the server to retrieve a new access token
  */
  private mounted() {
    console.log(this.$route.query.code);
    axios({
      url: "http://localhost:5010/token?code=" + this.$route.query.code,
      method: "GET"
    }).then(res => {
      res.status === 200 ? (this.gotBearer = true) : (this.gotBearer = false);
      this.isLoading = false;
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
