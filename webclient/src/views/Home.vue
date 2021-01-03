<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <Landing />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Landing from "@/components/Landing.vue"; // @ is an alias to /src

@Component({
  components: {
    Landing
  }
})
export default class Home extends Vue {}
</script>
