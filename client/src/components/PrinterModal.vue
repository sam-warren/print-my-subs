<template>
  <v-dialog v-model="dialog" width="500">
    <v-card>
      <v-card-title class="headline grey lighten-2">
        Search for a printer
      </v-card-title>
      <v-card-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog = false">
          Search
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";

@Component
export default class PrinterModal extends Vue {
  private dialog = false;
  @Prop() isVisible!: boolean;

  @Watch("isVisible")
  private onVisibilityChanged() {
    this.dialog = this.isVisible;
  }

  @Watch("dialog")
  private onDialogChange(val: boolean) {
    val || this.close();
  }

  private close() {
    this.$nextTick(() => {
      this.dialog = false;
      this.emitClose();
    });
  }

  @Emit()
  private emitClose() {
    return;
  }
}
</script>
