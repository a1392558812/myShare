import { getCurrentInstance, h, createApp } from "vue";

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

export default (propsComponents = {}) => {
  const components = Object.assign({}, propsComponents);

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
        targetThis.props.fileList,
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
          }),
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
              h(this.markdownComponent(), { text: result }),
            );
            markdownList.push(vNode);
          });

          const customDialog = await propsComponents.customDialog;

          const dialogVNode = h(
            customDialog,
            {},
            {
              default: () => markdownList,
            },
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
