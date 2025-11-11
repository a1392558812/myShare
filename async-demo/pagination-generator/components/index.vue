<template>
  <nav class="pagination-bar" role="navigation" aria-label="Pagination">
    <component v-for="part in normalizedOrder" :is="partComponent(part)" :key="part" />
  </nav>
</template>

<script setup lang="jsx">
import { computed, ref, watch, useSlots } from 'vue';

const props = defineProps({
  // 展示顺序：['pages', 'size-picker', 'quick-jumper']
  displayOrder: { type: Array, default: () => ['pages', 'size-picker', 'quick-jumper'] },
  pageTotal: { type: Number, default: 200 },
  modelValue: { type: Number, default: 1 },
  pageSlot: { type: Number, default: 7 },
  pageSizes: { type: Array, default: () => [10, 20, 30, 50] },
  pageSize: { type: Number, default: 10 },
});

const slotsStore = useSlots();
console.log('slotsStore', slotsStore)

const emits = defineEmits(['update:modelValue', 'update:pageSize', 'change', 'size-change', 'jump']);

const normalizedOrder = computed(() => {
  const allowed = new Set(['pages', 'size-picker', 'quick-jumper']);
  const unique = [];
  for (const k of props.displayOrder || []) {
    if (allowed.has(k) && !unique.includes(k)) unique.push(k);
  }
  return unique.length ? unique : ['pages', 'size-picker', 'quick-jumper'];
});

const pageCount = computed(() => Math.ceil((props.pageTotal || 0) / (props.pageSize || 10)));

const current = ref(Math.min(Math.max(1, props.modelValue || 1), Math.max(1, pageCount.value || 1)));
const curSize = ref(props.pageSize || (props.pageSizes[0] || 10));

watch(() => props.modelValue, (v) => {
  current.value = clampPage(v);
});
watch(() => props.pageTotal, () => {
  current.value = clampPage(current.value);
});
watch(() => props.pageSize, (v) => {

  curSize.value = v;
});

const clampPage = (p) => {
  const max = Math.max(1, pageCount.value || 1);
  const n = Math.floor(p || 1);
  return Math.min(Math.max(1, n), max);
};

const goTo = (p) => {
  const target = clampPage(p);
  if (target === current.value) return;
  current.value = target;
  emits('update:modelValue', target);
  emits('change', { page: target, pageSize: curSize.value });
};

const prev = () => goTo(current.value - 1);
const next = () => goTo(current.value + 1);

const pages = computed(() => {
  const total = Math.max(1, pageCount.value || 1);
  const slot = Math.max(3, Math.min(15, props.pageSlot || 7));

  if (total <= slot) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start, end;
  const center = current.value;

  let displayCount = slot;

  const showFirstPage = center > Math.ceil(slot / 2);
  const showLastPage = center < total - Math.floor(slot / 2);

  if (showFirstPage) displayCount--;
  if (showLastPage) displayCount--;

  const half = Math.floor(displayCount / 2);
  start = Math.max(1, center - half);

  end = Math.min(total, start + displayCount - 1);

  if (end - start + 1 < displayCount) {
    start = Math.max(1, end - displayCount + 1);
  }

  const res = [];

  if (start > 1) {
    res.push(1);
    if (start > 2) {
      res.push('…');
    }
  }

  for (let i = start; i <= end; i++) {
    res.push(i);
  }

  if (end < total) {
    if (end < total - 1) {
      res.push('…');
    }
    res.push(total);
  }

  console.log(start, end, res);
  return res;
});

const changeSize = (size) => {
  if (size === curSize.value) return;
  curSize.value = size;
  emits('update:pageSize', size);
  emits('size-change', { page: current.value, pageSize: size });
};

const jumpInput = ref('');
const doJump = () => {
  const n = Number(jumpInput.value);
  if (!Number.isFinite(n)) return;
  const target = clampPage(n);
  emits('jump', { from: current.value, to: target });
  goTo(target);
  jumpInput.value = '';
};

const partComponent = (part) => {
  switch (part) {
    case 'pages': return PagesPart;
    case 'size-picker': return SizePickerPart;
    case 'quick-jumper': return QuickJumperPart;
    default: return { template: '<div />' };
  }
};

const PagesPart = () => {
  return (<div class="pages-wrap">
    {
      slotsStore.pagePrev
        ? slotsStore.pagePrev({ click: prev, pageCount: pageCount.value })
        : (<button class="page-btn" disabled={current.value === 1} onClick={prev}>上一页</button>)
    }
    <ul class="pages">
      {pages.value.map((p, idx) => (
        <li key={idx}>
          {
            typeof p === 'number'
              ? (slotsStore.pageNumber
                ? slotsStore.pageNumber({
                  page: p,
                  click: () => goTo(p),
                }) : (<button
                  class={`page-number ${p === current.value ? 'active' : ''}`}
                  onClick={() => goTo(p)}>{p}</button>)
              )
              : (slotsStore.pageEllipsis
                ? slotsStore.pageEllipsis({ page: p })
                : (<span v-else class="ellipsis">{p}</span>)
              )
          }
        </li>
      ))}
    </ul>
    {
      slotsStore.pageNext
        ? slotsStore.pageNext({ click: next, pageCount: pageCount.value })
        : (<button class="page-btn" disabled={current.value === pageCount.value} onClick={next}>下一页</button>)
    }
  </div>)
};

const SizePickerPart = () => {
  return slotsStore.sizePicker
    ? slotsStore.sizePicker({ pageCount: pageCount.value })
    : (<div class="size-picker">
      每页：
      {
        props.pageSizes.find((size) => size === curSize.value)
          ? (<select value={curSize.value} onChange={(e) => changeSize(+e.target.value)}>
            {props.pageSizes.map((pageSizeItem) => {
              return <option key={pageSizeItem} value={pageSizeItem}>{pageSizeItem}</option>
            })}
          </select>)
          : curSize.value
      }
    </div>)
}

const QuickJumperPart = () => {
  return slotsStore.quickJumper
    ? slotsStore.quickJumper({ pageCount: pageCount.value })
    : (<div class="quick-jumper">
      跳至：
      <input type="number" value={jumpInput.value} onInput={(e) => jumpInput.value = e.target.value} min="1" step="1" />
      <button class="go-btn" onClick={doJump}>Go</button>
    </div >)
};

defineExpose({
  goTo,
  prev,
  next,
  changeSize,
  doJump,
});
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.pagination-bar {
  @include control-shared;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: #fff;
  border: 1px solid $medium-gray;
  border-radius: $border-radius;
  box-shadow: $shadow-light;

  :deep(.quick-jumper) {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    input {
      width: 80px;
      padding: 6px 10px;
      border: 1px solid $medium-gray;
      border-radius: $border-radius;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }

    .go-btn {
      @include button-shared;
      background-color: $primary-color;
      color: white;
      padding: 6px 10px;

      &:hover {
        background-color: darken($primary-color, 10%);
      }
    }
  }

  :deep(.size-picker) {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    select {
      padding: 6px 10px;
      border: 1px solid $medium-gray;
      border-radius: $border-radius;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }
  }

  :deep(.pages) {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: $spacing-xs;

    .page-number {
      @include button-shared;
      background-color: white;
      border: 1px solid $medium-gray;
      padding: 6px 10px;

      &.active {
        border-color: $primary-color;
        color: $primary-color;
        box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
      }
    }

    .ellipsis {
      color: $secondary-color;
      padding: 0 6px;
    }
  }

  :deep(.pages-wrap) {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .page-btn {
      flex-shrink: 0;
      @include button-shared;
      background-color: $light-gray;
      color: $dark-gray;
      padding: 6px 10px;

      &:hover {
        background-color: $medium-gray;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }
}
</style>