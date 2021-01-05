<template>
  <v-container>
    <v-row class="text-center mt-4">
      <v-col></v-col>
      <v-col cols="6">
        <h1 class="display-0 font-weight-medium">
          print my subs for
          <v-img
            :src="
              require('@/assets/images/extruded/TwitchExtrudedWordmarkPurple.svg')
            "
            class="my-3"
            contain
            height="130"
          />
        </h1>
        <h2 class="display-0 font-weight-light pt-4">
          is a free service that allows a user to authenticate with Twitch and
          set up a receipt printer on their local network to receive
          notifications each time a new user subscribes to your channel.
        </h2>
      </v-col>
      <v-col></v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col>
        <v-card class="mx-auto my-4" max-width="400">
          <v-card-title
            >Step 1: Authenticate with Twitch
            <v-img
              :src="require('@/assets/images/material-checkmark.svg')"
              class="my-3"
              contain
              height="25"
          /></v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                >You'll need to log into Twitch for us to send a subscriber
                update to your printer.</v-col
              >
            </v-row>
            <v-card-actions class="mt-4">
              <v-row class="text-center">
                <v-col
                  ><v-btn
                    v-if="!isAuthenticated"
                    block
                    class="button"
                    @click="onAuthButtonClicked()"
                    >Authetnicate</v-btn
                  >
                  <v-btn
                    v-else
                    block
                    class="secondary"
                    @click="onUnlinkButtonClicked()"
                    >Unlink Account</v-btn
                  >
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="mx-auto my-4" max-width="400">
          <v-card-title>Step 2: Connect a printer</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                >Connect a printer plugged into your computer or on your local
                network</v-col
              >
            </v-row>
            <v-card-actions class="mt-4">
              <v-row class="text-center">
                <v-col>
                  <v-btn block class="button">USB</v-btn>
                </v-col>
                <v-col><v-btn block class="button">WiFi/LAN</v-btn></v-col>
              </v-row>
            </v-card-actions>
          </v-card-text>
        </v-card> </v-col
      ><v-col>
        <v-card class="mx-auto my-4" max-width="400">
          <v-card-title>Step 3: Start Printing!</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                >Once you have completed the previous two steps, click start to
                begin printing your new subscribers!</v-col
              >
            </v-row>
            <v-card-actions class="mt-4">
              <v-row class="text-center">
                <v-col><v-btn block class="button">start</v-btn></v-col>
              </v-row>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
/* eslint-disable */

import { Component, Vue } from "vue-property-decorator";
import axios from "axios";

@Component({})
export default class Landing extends Vue {
  private isAuthenticated: boolean = false;

  private onAuthButtonClicked() {
    axios({
      url: "http://localhost:5010/client-id",
      method: "GET",
      headers: {}
    }).then(res => {
      window.location.href =
        "https://id.twitch.tv/oauth2/authorize?client_id=" +
        res.data.client_id +
        "&redirect_uri=http://localhost:8080/login-callback&response_type=code&scope=channel:read:subscriptions+channel_subscriptions";
    });
  }

  private onUnlinkButtonClicked() {
    console.log("Unlink");
  }
}
</script>
<style lang="scss">
@import "../assets/scss/_variables";
.button {
  background-color: $twitch_purple !important;
  color: white !important;
}
</style>
