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
          <v-card-title>Step 1: Authenticate with Twitch </v-card-title>
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
                    :disabled="isAuthenticated"
                    block
                    class="button"
                    @click="onAuthButtonClicked()"
                    >Authetnicate</v-btn
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
            <v-row class="text-center">
              <v-col>
                <v-btn block class="button" @click="toggleModal"
                  >Search for a printer</v-btn
                >
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-title>Step 3: Test your printer</v-card-title>
          <v-card-text>
            <div>
              Enter some text below, then click "print test" to print a test
              page and ensure your printer is connected and working as expected.
            </div>
            <v-row class="text-center mt-2">
              <v-col>
                <v-text-field
                  label="Text Input"
                  v-model="textInput"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  block
                  class="button"
                  :disabled="textInput === ''"
                  @click="printSomeText()"
                  >Print test</v-btn
                >
              </v-col>
            </v-row>
          </v-card-text>
        </v-card> </v-col
      ><v-col v-if="progress == 100">
        <v-row class="text-center">
          <v-col>
            <v-img
              :src="require('@/assets/images/material-checkmark.svg')"
              class="my-3"
              contain
              height="100"
            />
            <h1 class="pt-4 display-1 font-weight-medium">
              All set.
            </h1>
            <h2 class="pt-4 display-0 font-weight-light">
              This website will listen for new whispers and subscribers on your
              channel. Close all running windows to stop.
            </h2>
            <v-card class="mx-auto my-4" max-width="400">
              <v-card-title>Settings</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    ><v-switch
                      v-model="listenForSubs"
                      color="#9146ff"
                      label="Listen for new subscribers"
                    ></v-switch>
                    <v-switch
                      v-model="listenForWhispers"
                      color="#9146ff"
                      label="Listen for whispers"
                    ></v-switch
                  ></v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="progressContainer">
      <v-col
        ><v-progress-linear
          :color="twitchPurple"
          intermediate
          height="10"
          :value="progress"
          striped
        ></v-progress-linear>
      </v-col>
    </v-row>
    <PrinterModal
      :is-visible="isVisible"
      @emit-close="toggleModal"
      @emit-success="isPrinterConnected = true"
    />
  </v-container>
</template>

<script lang="ts">
/* eslint-disable */
import { Component, Vue, Watch } from "vue-property-decorator";
import PrinterModal from "./PrinterModal.vue";
import axios from "axios";
import { User } from "../interfaces/user";

@Component({
  components: {
    PrinterModal: PrinterModal
  }
})
export default class Landing extends Vue {
  private isAuthenticated: boolean = false;
  private isPrinterConnected: boolean = false;
  private textInput = "";
  private isVisible = false;
  private twitchPurple = "#9146ff";
  private listenForSubs = true;
  private listenForWhispers = true;

  private mounted() {
    this.getUser().then((res: User) => {
      if (res.id === "-1") {
        this.isAuthenticated = false;
      } else {
        this.isAuthenticated = true;
      }
    });
  }

  /*
      onAuthButtonClicked
      Initiates OAuth 2.0 procedure for Twitch.tv to set an access token
  */
  private onAuthButtonClicked() {
    axios({
      url: "http://localhost:5010/client-id",
      method: "GET",
      headers: {}
    }).then(res => {
      window.location.href =
        "https://id.twitch.tv/oauth2/authorize?client_id=" +
        res.data.client_id +
        "&redirect_uri=http://localhost:8080/login-callback&response_type=code&scope=channel:read:subscriptions+channel_subscriptions+whispers:read";
    });
  }

  private get progress(): string {
    let progress = 0;
    if (this.isAuthenticated) {
      progress += 50;
    }
    if (this.isPrinterConnected) {
      progress += 50;
    }
    return progress.toString();
  }

  /*
      printSomeText
      Prints the text input in the field
  */
  private printSomeText() {
    axios({
      url: "http://localhost:5010/print-text",
      method: "POST",
      data: {
        text: this.textInput
      }
    });
  }

  @Watch("listenForSubs")
  private toggleSubs() {
    axios({
      url: "http://localhost:5010/listen-for-subs",
      method: "POST",
      data: {
        listenForSubs: this.listenForSubs
      }
    });
  }

  @Watch("listenForWhispers")
  private toggleWhispers() {
    axios({
      url: "http://localhost:5010/listen-for-whispers",
      method: "POST",
      data: {
        listenForWhispers: this.listenForWhispers
      }
    });
  }

  /*
      onUnlinkButtonClicked
      Not yet implemented
  */
  private onUnlinkButtonClicked() {
    console.log("Unlink");
  }

  /*
      toggleModal
      Toggles the printer modal
  */
  private toggleModal() {
    this.isVisible = !this.isVisible;
  }

  private getUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      axios({
        url: "http://localhost:5010/user",
        method: "GET"
      }).then(res => {
        return resolve(res.data.user);
      });
    });
  }
}
</script>
<style lang="scss">
@import "../assets/scss/_variables";
.button {
  background-color: $twitch_purple !important;
  color: white !important;
}

.button[disabled] {
  background-color: $widow !important;
  color: white !important;
}

.progressContainer {
  padding-top: 150px;
}
</style>
