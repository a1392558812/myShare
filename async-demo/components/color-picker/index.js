import { h, ref, computed, watch, onUnmounted } from "vue";

export const hexToRgba = (hex, alpha = 1) => {
  hex = hex.replace(/^#/, "");

  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const rgbaToHex = (rgba, digit = 6) => {
  const result = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i.exec(
    rgba
  );
  if (!result) return "#000000";

  const r = parseInt(result[1]);
  const g = parseInt(result[2]);
  const b = parseInt(result[3]);
  const toHex = (x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  if (digit === 8) {
    const a = (result[4] ? parseFloat(result[4]) : 1) * 255;
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const parseRgba = (rgbaStr) => {
  const result = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i.exec(
    rgbaStr
  );
  if (!result) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  return {
    r: parseInt(result[1]),
    g: parseInt(result[2]),
    b: parseInt(result[3]),
    a: result[4] ? parseFloat(result[4]) : 1,
  };
};

export const createRgba = (r, g, b, a) => {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const colorPicker = {
  name: "ColorPicker",
  props: {
    modelValue: {
      type: String,
      default: "rgba(0, 0, 0, 1)",
    },
    tipsStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const r = ref(0);
    const g = ref(0);
    const b = ref(0);
    const a = ref(1);
    const hex = ref("#000000");
    const ifShowTips = ref(false);
    const colorPickerRef = ref(null);

    const currentRgba = computed(() => {
      return createRgba(r.value, g.value, b.value, a.value.toFixed(2));
    });

    const updateColor = () => {
      const rgba = currentRgba.value;
      hex.value = rgbaToHex(rgba);
      emit("update:modelValue", rgba);
    };

    const initFromModelValue = () => {
      const parsed = parseRgba(props.modelValue);
      console.log("parsed", parsed);
      r.value = parsed.r;
      g.value = parsed.g;
      b.value = parsed.b;
      a.value = parsed.a;
      hex.value = rgbaToHex(props.modelValue);
    };

    const outSideClick = (e) => {
      if (!colorPickerRef.value.contains(e.target)) {
        ifShowTips.value = false;
      }
    };

    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue !== currentRgba.value) {
          initFromModelValue();
        }
      },
      {
        immediate: true,
      }
    );

    watch([r, g, b, a], () => {
      updateColor();
    });

    onUnmounted(() => {
      document.removeEventListener("click", outSideClick, true);
    });

    return () =>
      h(
        "div",
        {
          style: {
            position: "relative",
            display: "inline-block",
            verticalAlign: "middle",
            width: "22px",
            height: "22px",
            cursor: "pointer",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "4px",
          },
          ref: colorPickerRef,
          onClick: (e) => {
            e.stopPropagation();
            e.preventDefault();
            ifShowTips.value = true;
            document.addEventListener("click", outSideClick, true);
          },
        },
        [
          h(
            "div",
            {
              style: {
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "calc(100% - 4px * 2)",
                height: "calc(100% - 4px * 2)",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundImage:
                  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(135deg, transparent 75%, #ccc 75%)",
                backgroundSize: "12px 12px",
                backgroundPosition: "0 0, 6px 0, 6px -6px, 0 6px",
              },
            },
            [
              h("div", {
                style: {
                  width: "100%",
                  height: "100%",
                  backgroundColor: currentRgba.value,
                  borderRadius: "4px",
                },
              }),
            ]
          ),
          ifShowTips.value
            ? h(
                "div",
                {
                  style: {
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "300px",
                    flexShrink: 0,
                    padding: "16px",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    zIndex: 1000,
                    ...props.tipsStyle,
                  },
                  onClick: (e) => {
                    e.stopPropagation();
                  },
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "8px",
                      },
                      class: "color-picker",
                    },
                    [
                      h("input", {
                        type: "color",
                        value: hex.value,
                        onInput: (e) => {
                          console.log(e.target.value);
                          const hexValue = e.target.value.startsWith("#")
                            ? e.target.value
                            : "#" + e.target.value;
                          const parsed = parseRgba(
                            hexToRgba(hexValue, a.value)
                          );
                          r.value = parsed.r;
                          g.value = parsed.g;
                          b.value = parsed.b;
                        },
                        style: {
                          width: "29px",
                          height: "29px",
                          flexShrink: 0,
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                          cursor: "pointer",
                        },
                      }),
                      h("input", {
                        type: "text",
                        value: currentRgba.value,
                        readonly: true,
                        style: {
                          width: "12em",
                          flexShrink: 0,
                          padding: "6px 8px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "13px",
                          backgroundColor: "#f5f5f5",
                          color: "#666",
                        },
                      }),
                      h("div", {
                        style: {
                          flex: 1,
                          height: "1em",
                          padding: "6px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          backgroundColor: currentRgba.value,
                        },
                        onClick: (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        },
                      }),
                    ]
                  ),
                  h(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      },
                    },
                    [
                      h(
                        "span",
                        { style: { fontSize: "13px", flexShrink: 0 } },
                        "透明度："
                      ),
                      h("input", {
                        type: "range",
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: a.value,
                        onInput: (e) => {
                          console.log(e.target.value);
                          a.value = +e.target.value;
                        },
                        style: {
                          width: "100%",
                          height: "0px",
                          borderRadius: "0px",
                          outline: "none",
                          padding: "8px 0",
                        },
                      }),
                    ]
                  ),
                ]
              )
            : null,
        ]
      );
  },
};
