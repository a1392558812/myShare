import { h } from "vue";
const randomX2Y = (x, y, fixed = 0) =>
  Number((Math.random() * (y - x) + x).toFixed(fixed));

export const slotCom1 = (props) => {
  const style = {
    width: `220px`,
    height: `220px`,
    background: "rgba(255,255,00,0.7)",
  };
  return h("div", { style, class: "demo-content" }, [
    h("div", { class: "demo-box" }, [
      h(
        "p",
        {},
        `定宽高-可拖拽内容-width:${style.width}, height:${style.height}`
      ),
      h("p", { style: { color: "red" } }, `元素id:${props.elementId}`),
      h("p", {}, "当靠近辅助线时会自动吸附"),
    ]),
  ]);
};

export const slotCom2 = (props) => {
  const style = {
    width: `${randomX2Y(150, 250)}px`,
    height: `${randomX2Y(200, 350)}px`,
    background: "rgba(100,100,100,0.7)",
  };
  return h("div", { style, class: "demo-content" }, [
    h("div", { class: "demo-box" }, [
      h(
        "h4",
        {},
        `随机宽高-可拖拽内容2-width:${style.width}, height:${style.height}`
      ),
      h("p", { style: { color: "red" } }, `元素id:${props.elementId}`),
    ]),
  ]);
};

export const slotCom3 = (props) => {
  const style = {
    width: `${randomX2Y(199, 256)}px`,
    height: `${randomX2Y(234, 321)}px`,
    background: "rgba(255,100,100,0.7)",
  };
  return h("div", { style, class: "demo-content" }, [
    h("div", { class: "demo-box" }, [
      h(
        "p",
        {},
        `随机宽高-可拖拽内容3-width:${style.width}, height:${style.height}`
      ),
      h("p", { style: { color: "red" } }, `元素id:${props.elementId}`),
    ]),
  ]);
};

export const slotCom4 = (props) => {
  const style = {
    width: `${randomX2Y(150, 250)}px`,
    height: `${randomX2Y(200, 350)}px`,
    background: "rgba(255,100,00,0.7)",
  };
  return h("div", { style, class: "demo-content" }, [
    h("div", { class: "demo-box" }, [
      h(
        "p",
        {},
        `随机宽高-可拖拽内容4-width:${style.width}, height:${style.height}`
      ),
      h("p", { style: { color: "red" } }, `元素id:${props.elementId}`),
      h(
        "input",
        { style: { width: "4em", display: "block" }, value: style.width },
        "k宽："
      ),
      h(
        "input",
        { style: { width: "4em", display: "block" }, value: style.height },
        "高："
      ),
    ]),
  ]);
};
