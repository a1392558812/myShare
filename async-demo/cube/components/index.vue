<template>
  <div
    :style="cubeWrapStyle"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <div :style="containerStyle">
      <div :style="cubeStyle">
        <div
          v-for="(itemStyle, index) in [
            cubeFaceFrontStyle,
            cubeFaceBackStyle,
            cubeFaceLeftStyle,
            cubeFaceRightStyle,
            cubeFaceTopStyle,
            cubeFaceBottomStyle,
          ]"
          :style="itemStyle"
          :key="index"
        ></div>
      </div>

      <div v-if="showAxis" :style="axisWrapStyle">
        <div
          v-for="(item, index) in [
            {
              label: 'X',
              lineStyle: axisXLineStyle,
              labelStyle: axisXLabelStyle,
            },
            {
              label: 'Y',
              lineStyle: axisYLineStyle,
              labelStyle: axisYLabelStyle,
            },
            {
              label: 'Z',
              lineStyle: axisZLineStyle,
              labelStyle: axisZLabelStyle,
            },
          ]"
          :key="index"
          :style="axisLineWrapStyle"
        >
          <div :style="item.lineStyle">
            <span :style="item.labelStyle">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  // 是否显示坐标轴
  showAxis: {
    type: Boolean,
    default: true,
  },
  // 立方体大小
  size: {
    type: Number,
    default: 100,
  },
  // 面之间的间隙
  gap: {
    type: Number,
    default: 0,
  },
  // 旋转角度
  rotation: {
    type: Object,
    default: () => ({ x: 0, y: 0, z: 0 }),
  },
  // 旋转中心点
  rotationOrigin: {
    type: Object,
    default: () => ({ x: 0, y: 0, z: 0 }),
  },
  // 位移
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0, z: 0 }),
  },
  // 自定义样式
  customStyle: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:rotation", "cubeStyleChange"]);

const isDragging = ref(false);
const startMousePos = ref({ x: 0, y: 0 });
const startRotation = ref({ ...props.rotation });

const cubeWrapStyle = computed(() =>
  Object.assign(
    {
      cursor: isDragging.value ? "grabbing" : "grab",
      transform: "translate3d(0, 0, 0)",
      userSelect: "none",
    },
    props.customStyle,
  ),
);

const containerStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  perspective: "1000px",
  transform: "translate3d(0, 0, 0)",
  position: "relative",
  transformStyle: "preserve-3d",
  pointerEvents: "none",
}));

const cubeTransform = computed(
  () => `
      rotateX(${props.rotation.x}deg)
      rotateY(${props.rotation.y}deg)
      rotateZ(${props.rotation.z}deg)
      translate3d(${props.position.x}px, ${props.position.y}px, ${props.position.z}px)
    `,
);

const transformOrigin = computed(
  () =>
    `${props.rotationOrigin.x}px ${props.rotationOrigin.y}px ${props.rotationOrigin.z}px`,
);

const cubeStyle = computed(() => {
  const style = {
    width: `${props.size}px`,
    height: `${props.size}px`,
    transformOrigin: transformOrigin.value,
    transform: cubeTransform.value,
    position: "relative",
    transformStyle: "preserve-3d",
  };
  if (isDragging.value) {
    style.willChange = "transform";
  } else {
    style.willChange = "auto";
    style.transition = "transform 0.5s ease";
  }
  return style;
});

const cubeFaceStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  border: "1px solid rgba(51, 51, 51, 0.3)",
};

const cubeFaceFrontStyle = computed(() =>
  Object.assign({}, cubeFaceStyle, {
    transform: `translateZ(${props.size / 2 + props.gap}px)`,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
  }),
);

const cubeFaceBackStyle = computed(() =>
  Object.assign({}, cubeFaceStyle, {
    transform: `translateZ(-${props.size / 2 + props.gap}px)`,
    backgroundColor: "rgba(0, 255, 0, 0.8)",
  }),
);

const cubeFaceLeftStyle = computed(() =>
  Object.assign({}, cubeFaceStyle, {
    transform: `rotateY(90deg) translateZ(-${props.size / 2 + props.gap}px)`,
    backgroundColor: "rgba(0, 0, 255, 0.8)",
  }),
);

const cubeFaceRightStyle = computed(() =>
  Object.assign({}, cubeFaceStyle, {
    transform: `rotateY(90deg) translateZ(${props.size / 2 + props.gap}px)`,
    backgroundColor: "rgba(255, 255, 0, 0.8)",
  }),
);

const cubeFaceTopStyle = computed(() =>
  Object.assign({}, cubeFaceStyle, {
    transform: `rotateX(90deg) translateZ(${props.size / 2 + props.gap}px)`,
    backgroundColor: "rgba(128, 0, 128, 0.8)",
  }),
);

const cubeFaceBottomStyle = computed(() =>
  Object.assign({}, cubeFaceStyle, {
    transform: `rotateX(90deg) translateZ(-${props.size / 2 + props.gap}px)`,
    backgroundColor: "rgba(255, 165, 0, 0.8)",
  }),
);

const axisWrapStyle = computed(() => {
  const style = {
    transformOrigin: cubeTransform.value,
    transform: cubeTransform.value,
    position: "absolute",
    top: "50%",
    left: "50%",
    transformStyle: "preserve-3d",
  };
  if (!isDragging.value) {
    style.transition = "transform 0.5s ease";
  }
  return style;
});

const axisLineWrapStyle = {
  position: "absolute",
  transformStyle: "preserve-3d",
};

const axisLineStyle = computed(() => ({
  width: `${props.size * 3}px`,
  height: `2px`,
  position: "absolute",
  backgroundColor: "currentColor",
  transformOrigin: "left center",
  fontSize: "12px",
  fontWeight: "bold",
  color: "currentColor",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  transformStyle: "preserve-3d",
  transformOrigin: "0 0 0",
}));

const axisXLineStyle = computed(() => {
  return Object.assign({}, axisLineStyle.value, {
    color: "red",
    transform: `rotateX(${180 - props.rotation.x}deg) translateX(-${props.size * 1.5}px) rotateY(0deg)`,
  });
});

const axisXLabelStyle = computed(() => ({
  position: "absolute",
  top: "50%",
  right: "-1.5em",
  transform: `translateY(-50%)`,
  userSelect: "none",
}));

const axisYLineStyle = computed(() =>
  Object.assign({}, axisLineStyle.value, {
    color: "green",
    transform: `rotateY(${180 - props.rotation.y}deg) translateY(-${props.size * 1.5}px) rotateZ(90deg)`,
  }),
);

const axisYLabelStyle = computed(() => ({
  position: "absolute",
  top: "50%",
  left: "-1.5em",
  transform: "translateY(-50%) rotate(-90deg)",
  userSelect: "none",
}));

const axisZLineStyle = computed(() =>
  Object.assign({}, axisLineStyle.value, {
    color: "blue",
    transform: `rotateZ(${180 - props.rotation.z}deg) rotateY(90deg) translateX(-${props.size * 1.5}px) `,
  }),
);

const axisZLabelStyle = computed(() => ({
  position: "absolute",
  top: "50%",
  left: "-1.5em",
  transform: "translateY(-50%)",
  userSelect: "none",
}));

const onMouseMove = (event) => {
  if (!isDragging.value) return;

  const deltaX = event.clientX - startMousePos.value.x;
  const deltaY = event.clientY - startMousePos.value.y;

  const newRotation = {
    x: startRotation.value.x - deltaY * 0.5,
    y: startRotation.value.y + deltaX * 0.5,
    z: startRotation.value.z,
  };
  console.log(newRotation.x, newRotation.y, newRotation.z);
  emit("update:rotation", newRotation);
};

const onMouseUp = () => {
  isDragging.value = false;
};

const onMouseDown = (event) => {
  if (isDragging.value) return;
  isDragging.value = true;
  startMousePos.value = {
    x: event.clientX,
    y: event.clientY,
  };
  startRotation.value = { ...props.rotation };
};

watch(
  () => [
    cubeWrapStyle.value,
    containerStyle.value,
    cubeStyle.value,
    cubeFaceFrontStyle.value,
    cubeFaceBackStyle.value,
    cubeFaceLeftStyle.value,
    cubeFaceRightStyle.value,
    cubeFaceTopStyle.value,
    cubeFaceBottomStyle.value,
    axisWrapStyle.value,
    axisXLineStyle.value,
    axisXLabelStyle.value,
    axisYLineStyle.value,
    axisYLabelStyle.value,
    axisZLineStyle.value,
    axisZLabelStyle.value,
    props.showAxis,
  ],
  () => {
    emit("cubeStyleChange", {
      cubeWrapStyle: cubeWrapStyle.value,
      containerStyle: containerStyle.value,

      cubeStyle: cubeStyle.value,

      cubeFaceFrontStyle: cubeFaceFrontStyle.value,
      cubeFaceBackStyle: cubeFaceBackStyle.value,
      cubeFaceLeftStyle: cubeFaceLeftStyle.value,
      cubeFaceRightStyle: cubeFaceRightStyle.value,
      cubeFaceTopStyle: cubeFaceTopStyle.value,
      cubeFaceBottomStyle: cubeFaceBottomStyle.value,

      axisWrapStyle: axisWrapStyle.value,
      axisLineWrapStyle,

      // X轴
      axisXLineStyle: axisXLineStyle.value,
      axisXLabelStyle: axisXLabelStyle.value,

      // Y轴
      axisYLineStyle: axisYLineStyle.value,
      axisYLabelStyle: axisYLabelStyle.value,

      // Z轴
      axisZLineStyle: axisZLineStyle.value,
      axisZLabelStyle: axisZLabelStyle.value,
    });
  },
  { immediate: true },
);
</script>
