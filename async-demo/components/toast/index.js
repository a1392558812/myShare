import toast from "./index.vue";
import { createApp } from "vue";

let toastInstance;

export const toastFun = {
  open: (options = {}) => {
    console.log("options", options);
    if (!toastInstance) {
      let divNode = document.getElementById("custom-toast-wrap");
      if (!divNode) {
        divNode = document.createElement("div");
        divNode.id = "custom-toast-wrap";
      }
      toastInstance = createApp(toast).mount(divNode);
      document.body.appendChild(divNode);
    }

    const optionsOnClose = options.onClose;
    options.onClose = () => {
      optionsOnClose && optionsOnClose();
      document.getElementById("custom-toast-wrap")?.remove();
      toastInstance = null;
    };

    toastInstance.open(options);
  },
  close: () => {
    if (toastInstance) {
      toastInstance.close();
    }
  },
};
