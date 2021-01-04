<template>
  <v-app dark>
    <v-app-bar app color="#9146FF" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Twitch Logo"
          class="shrink mr-4"
          contain
          src="@/assets/images/wordmark/Twitch-Wordmark-White.svg"
          transition="scale-transition"
          width="120"
        />
        <h1 class="display-0 font-weight-light">
          print my subs
        </h1>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        href="https://github.com/sam-warren/print-my-subs"
        target="_blank"
        text
      >
        <span class="mr-2">source code</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({});
</script>
<style lang="scss"></style>
