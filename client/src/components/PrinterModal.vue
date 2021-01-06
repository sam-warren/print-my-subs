<template>
  <v-dialog v-model="dialog" width="500">
    <v-card v-if="hasTriedConnect === false">
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
    <v-card v-else-if="hasTriedConnect && printerConnected">
      <v-card-title>Sweet!</v-card-title>
      <v-card-text
        >We were able to connect to {{ selectedPrinter }}. Make sure to print a
        test page to make sure everything is working correctly.</v-card-text
      >
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="button mb-2" @click="close()">close</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-else-if="hasTriedConnect && !printerConnected"
      ><v-card-title>Uh oh...</v-card-title>
      <v-card-text
        >Looks like we couldn't connect to your printer. Feel free to go back
        and try again with a different printer or printer type.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="button mb-2" @click="hasTriedConnect = false"
          >Try again</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
/* eslint-disable */
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
import axios from "axios";

@Component
export default class PrinterModal extends Vue {
  private dialog: boolean = false;
  private printers: string[] = [];
  private selectedPrinter: string = "";
  private selectedPrinterType: string = "";
  private printerTypes: string[] = ["EPSON", "STAR"];
  private hasTriedConnect: boolean = false;
  private printerConnected: boolean = false;

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
    axios({
      url: "http://localhost:5010/printers",
      method: "POST",
      data: {
        printer: this.selectedPrinter,
        printerType: this.selectedPrinterType
      }
    }).then(res => {
      console.log(res);
      if (res.status === 200) {
        this.hasTriedConnect = true;
        this.printerConnected = true;
      } else {
        this.hasTriedConnect = true;
        this.printerConnected = false;
      }
    });
  }

  private close() {
    this.dialog = false;
    this.hasTriedConnect = false;
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
</style>
