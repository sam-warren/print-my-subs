<template>
  <div>
    Nice! You're all set.
  </div>
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
