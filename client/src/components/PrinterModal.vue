<template>
  <v-dialog v-model="dialog" width="500">
    <v-card v-if="!hasTriedConnect">
      <v-card-title class="headline">
        Search for a printer
      </v-card-title>
      <v-card-text
        >We'll automatically find printers connected to your computer. Just
        select the name of your thermal printer from the dropdown below.
        <v-select
          class="mt-4"
          :items="printers"
          v-model="selectedPrinter"
          label="Select a printer"
          outlined
        >
        </v-select>
        <v-select
          v-show="selectedPrinter !== ''"
          :items="printerTypes"
          v-model="selectedPrinterType"
          label="Choose the type of pritner"
          outlined
        >
        </v-select>
        <div v-show="selectedPrinter !== ''">
          <v-alert class="alert" type="info" color="#57BEE6">
            If you don't know what type of printer you have, choose EPSON. If
            that doesn't work, try STAR.
          </v-alert>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="button mb-2" @click="setPrinter()">Search</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else>
      <v-card-title>Did it work?</v-card-title>
      <v-card-text
        >We just tried to print a message from your printer. If it worked,
        you're ready to move onto the next step! If not, please try different
        settings.</v-card-text
      >
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="button-outline mb-2" @click="goBack()"
          >Try new settings</v-btn
        >
        <v-btn class="button mb-2" @click="exit()">It worked!</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
/* eslint-disable */
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
import axios from "axios";
import { nextTick } from "vue/types/umd";

@Component
export default class PrinterModal extends Vue {
  private dialog: boolean = false;
  private printers: string[] = [];
  private selectedPrinter: string = "";
  private selectedPrinterType: string = "";
  private printerTypes: string[] = ["EPSON", "STAR"];
  private hasTriedConnect: boolean = false;

  @Prop() isVisible!: boolean;

  @Watch("isVisible")
  private onVisibilityChanged() {
    this.dialog = this.isVisible;
  }

  @Watch("dialog")
  private onDialogChange(val: boolean) {
    val || this.close();
  }

  private mounted() {
    axios({
      url: "http://localhost:5010/printers",
      method: "GET"
    }).then(res => {
      console.log(res);
      res.data.printers.forEach((printer: any) => {
        this.printers.push(printer.name);
      });
    });
  }

  private setPrinter() {
    this.hasTriedConnect = true;
    axios({
      url: "http://localhost:5010/printers",
      method: "POST",
      data: {
        printer: this.selectedPrinter,
        printerType: this.selectedPrinterType
      }
    }).then(res => {
      console.log(res);
    });
  }

  private goBack() {
    this.hasTriedConnect = false;
  }

  private exit() {
    this.dialog = false;
    setTimeout(() => {
      this.hasTriedConnect = false;
    }, 500);
  }

  private close() {
    this.dialog = false;
    this.emitClose();
  }

  @Emit()
  private emitClose() {
    return;
  }
}
</script>
<style lang="scss">
@import "../assets/scss/_variables";
.button {
  background-color: $twitch_purple !important;
  color: white !important;
}

.button-outline {
  background-color: white !important;
  color: $twitch_purple !important;
}
</style>
