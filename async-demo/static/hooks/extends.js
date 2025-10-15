import { getCurrentInstance, h, createApp } from "vue";

// 此段代码为耦合代码，这里我图省事了
export let toastFun;

export const defaultProps = {
  fileList: {
    type: Array,
    default: () => [],
  },
  markdownComponent: {
    type: Function,
    default: () => {},
  },
};

const getTargetThis = (currentInstance) => {
  let targetComponent = currentInstance.parent;
  if (targetComponent && targetComponent.props) {
    if (targetComponent.props.markdownComponent) {
      return targetComponent;
    } else {
      return getTargetThis(targetComponent);
    }
  }

  throw new Error("getTargetThis: markdownComponent not found");
};

const initToast = (propsComponents) => {
  if (propsComponents.toast) {
    if (!toastFun) {
      const divNode = document.createElement("div");
      divNode.id = "custom-toast-container";
      propsComponents.toast.then((res) => {
        const toastApp = createApp(res);
        toastFun = toastApp.mount(divNode);
        console.log("toastVNode", res);
        document.body.appendChild(divNode);
      });
    }
  }
};

export default (propsComponents = {}) => {
  const components = Object.assign({}, propsComponents);

  initToast(components);
  let markdownComponentFun = () => "";

  components.markdownComponent = (attrs) => {
    try {
      const currentInstance = getCurrentInstance();
      const targetThis = getTargetThis(currentInstance);
      markdownComponentFun = targetThis.props.markdownComponent;
      const result = h(markdownComponentFun(), attrs);
      return result;
    } catch (error) {
      markdownComponentFun =
        error instanceof Error ? error.toString() : String(error);
      console.error("error", error);
    }
  };

  components.codeContent = () => {
    try {
      const currentInstance = getCurrentInstance();
      const targetThis = getTargetThis(currentInstance);
      markdownComponentFun = targetThis.props.markdownComponent;

      console.log(
        "currentInstance",
        targetThis.ctx.computedContent,
        targetThis.props.fileList
      );
      const childrenList = [];
      targetThis.props.fileList.forEach((item) => {
        const result = h(
          "div",
          {
            key: item.path,
            title: item.path,
            style: {
              width: "100%",
            },
          },
          h(markdownComponentFun(), {
            text: targetThis.ctx.computedContent(item),
          })
        );
        childrenList.push(result);
      });

      return childrenList;
    } catch (error) {
      markdownComponentFun =
        error instanceof Error ? error.toString() : String(error);
      console.error("error", error);
    }
  };

  return {
    props: defaultProps,
    components,
    data() {
      return {
        dialogInstance: null,
        toastRef: null,
      };
    },
    methods: {
      computedContent(item) {
        console.log("item", item);
        return (
          item.path +
          "\n" +
          "```" +
          item.suffix +
          "\n" +
          item.content +
          "\n" +
          "```"
        );
      },
      async openDialog(options = {}) {
        console.log("options", options);
        if (!this.dialogInstance) {
          const divNode = document.createElement("div");
          divNode.id = "custom-dialog-container";

          const markdownList = [];
          this.fileList.forEach((item) => {
            const result = this.computedContent(item);
            const vNode = h(
              "div",
              {
                key: item.path,
                title: item.path,
              },
              h(this.markdownComponent(), { text: result })
            );
            markdownList.push(vNode);
          });

          const customDialog = await propsComponents.customDialog;

          const dialogVNode = h(
            customDialog,
            {},
            {
              default: () => markdownList,
            }
          );

          const dialogApp = createApp(dialogVNode);
          this.dialogInstance = dialogApp.mount(divNode);
          document.body.appendChild(divNode);
        }
        this.dialogInstance.showDialog(options);
      },
    },
  };
};
