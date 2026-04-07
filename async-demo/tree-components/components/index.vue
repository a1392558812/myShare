<template>
  <div :style="customStyle" class="tree-container">
    <TreeItem
      v-for="(node, index) in list"
      :key="node.value"
      :node="node"
      :level="0"
      :keyIndex="[index]"
      @toggleClick="onToggleClick"
    >
    </TreeItem>
  </div>
</template>

<script setup lang="jsx">
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
  customDetailsStyle: {
    type: Function,
    default: ({ node, level, keyIndex }) => ({ color: "inherit" }),
  },
  customSummaryStyle: {
    type: Function,
    default: ({ node, level, keyIndex }) => ({ color: "inherit" }),
  },
  customLabelStyle: {
    type: Function,
    default: ({ node, level, keyIndex }) => ({ color: "inherit" }),
  },
  customIconWrapStyle: {
    type: Function,
    default: ({ node, level, keyIndex }) => ({ color: "inherit" }),
  },
  customIconStyle: {
    type: Function,
    default: ({ node, level, keyIndex }) => ({ color: "inherit" }),
  },
});

const emit = defineEmits(["toggleClick"]);

const onToggleClick = ({ keyIndex, event }) => {
  emit("toggleClick", { keyIndex, event });
};

const TreeItem = ({ node, level, keyIndex }, ctx) => {
  const classStr = [
    "tree-node",
    !node.children || node.children.length === 0 ? "leaf" : "folder",
  ].join(" ");

  const hasChildren = node.children && node.children.length > 0;

  const emitEvent = ({ keyIndex, event }) => {
    ctx.emit("toggleClick", {
      keyIndex,
      event,
    });
  };

  return (
    <details
      style={props.customDetailsStyle({ node, level, keyIndex })}
      open={node.isOpen ? "open" : "close"}
      key-value={node.value}
      class={classStr}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (hasChildren) {
          emitEvent({ keyIndex, event: e });
        }
      }}
    >
      {node.summaryBefore
        ? node.summaryBefore({ node, level, keyIndex })
        : ctx.slots.summaryBefore
          ? ctx.slots.summaryBefore({ node, level, keyIndex })
          : null}
      <summary
        style={Object.assign(
          {
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "4px",
            transition: "background-color 0.2s ease",
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            lineHeight: 1.5,
          },
          props.customSummaryStyle({ node, level, keyIndex }),
        )}
      >
        {node.beforeIcon ? (
          node.beforeIcon({ node, level, keyIndex })
        ) : ctx.slots.beforeIcon ? (
          ctx.slots.beforeIcon({ node, level, keyIndex })
        ) : hasChildren ? (
          <div
            style={Object.assign(
              { marginRight: "0.5em" },
              props.customIconWrapStyle({ node, level, keyIndex }),
            )}
          >
            <div
              style={Object.assign(
                {
                  transition: "transform 0.2s ease",
                  transform: `rotate(${node.isOpen ? 90 : 0}deg)`,
                  fontSize: "12px",
                },
                props.customIconStyle({ node, level, keyIndex }),
              )}
            >
              ▶
            </div>
          </div>
        ) : null}
        {node.defaultSlot ? (
          node.defaultSlot({ node, level, keyIndex })
        ) : ctx.slots.defaultSlot ? (
          ctx.slots.defaultSlot({ node, level, keyIndex })
        ) : (
          <span style={props.customLabelStyle({ node, level, keyIndex })}>
            {node.label}
          </span>
        )}
        {node.afterIcon ? (
          node.afterIcon({ node, level, keyIndex })
        ) : ctx.slots.afterIcon ? (
          ctx.slots.afterIcon({ node, level, keyIndex })
        ) : (
          <span
            style={{
              marginLeft: "0.5em",
              width: "1em",
              height: "1em",
              lineHeight: "1em",
              textAlign: "center",
            }}
          >
            {hasChildren ? "📁" : "📄"}
          </span>
        )}
      </summary>
      {hasChildren && (node.hasRendered ? true : node.isOpen) && (
        <div
          style={{
            display: node.hasRendered
              ? node.isOpen
                ? "block"
                : "none"
              : "block",
          }}
        >
          {node.children.map((child, index) => (
            <TreeItem
              key={child.value}
              keyIndex={[...(keyIndex || []), index]}
              node={child}
              level={level + 1}
              onToggleClick={({ keyIndex, event }) => {
                emitEvent({ keyIndex, event });
              }}
            />
          ))}
        </div>
      )}
      {node.summaryAfter
        ? node.summaryAfter({ node, level, keyIndex })
        : ctx.slots.summaryAfter
          ? ctx.slots.summaryAfter({ node, level, keyIndex })
          : null}
    </details>
  );
};
</script>

<style scoped lang="scss">
.tree-container {
  max-width: 400px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  .tree-node {
    margin: 4px 0;
    padding-left: 0;
    border: none;
    list-style: none;
    cursor: default;
    ::v-deep(summary) {
      &:hover {
        background-color: #e8f4ff;
      }
      &::-webkit-details-marker {
        display: none;
      }
      &::marker {
        display: none;
      }
    }
    ::v-deep(.tree-node) {
      padding-left: 12px;
    }
  }
  .tree-node.leaf {
    summary {
      padding-left: 0;
    }
  }
}
</style>
