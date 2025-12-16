<script lang="jsx">
import { defineComponent, ref, computed } from 'vue'

const useCopyCode = () => {
  const copied = ref(false);
  const onCopyClick = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    });
  };
  return {
    copied,
    onCopyClick,
  }
}

const inputCom = defineComponent({
  props: {
    modelValue: { type: Number | Boolean | String, default: 0 },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: 1 },
    placeholder: { type: String, default: '' },
    type: { type: String, default: 'text' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputClass = computed(() => {
      if (props.type === 'number') return 'number-control'
      if (props.type === 'range') return 'range-control'
      if (props.type === 'text') return 'text-control'
      if (props.type === 'checkbox') return 'checkbox-control'
      return ''
    })

    const onInput = (e) => {
      let value = e.target.value;
      if (['number', 'range'].includes(props.type)) {
        value = Number(e.target.value);
        if (props.min !== undefined && value < Number(props.min)) {
          value = Number(props.min)
        } else if (props.max !== undefined && value > Number(props.max)) {
          value = Number(props.max)
        }
      }
      if (props.type === 'checkbox') {
        value = Boolean(e.target.checked)
        e.target.checked = value;
      }
      emit('update:modelValue', value);
      e.target.value = value;
    }

    const currentValue = computed(() => {
      if (props.type === 'checkbox') {
        return Boolean(props.modelValue)
      } else if (props.type === 'text') {
        return String(props.modelValue)
      } else if (['number', 'range'].includes(props.type)) {
        return Number(props.modelValue)
      }
      return props.modelValue
    })

    return () => {
      return (
        <input type={props.type} class={inputClass.value} step={Number(props.step)}
          min={props.min} max={props.max} placeholder={props.placeholder} checked={currentValue.value} value={currentValue.value}
          onInput={onInput} />
      )
    }
  }
})

const selectCom = defineComponent({
  props: {
    modelValue: { type: String | Number, default: '' },
    options: { type: Array, default: () => [] },
    currentLabel: { type: String, default: '' },
    ifShowLabel: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onInput = (e) => {
      emit('update:modelValue', e.target.value);
    }
    return () => {
      return (
        <div class="select-control">
          <select class='select-control' placeholder={props.placeholder} style={{ opacity: props.ifShowLabel ? 0 : 1 }} value={props.modelValue} onInput={onInput}>
            {props.options.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          {
            props.ifShowLabel ? (<button class="select-control-btn">{(() => {
              if (props.currentLabel) return props.currentLabel
              const target = props.options.find((item) => `${item.value}` === `${props.modelValue}`)
              if (target) return target.label || props.modelValue
              return props.modelValue
            })()}</button>) : null
          }
        </div>
      )
    }
  },
})

const customBtnCom = defineComponent({
  props: {
    inputType: { type: String, default: '' },
    slotProps: { type: Object, default: () => ({}) },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const onClick = (e) => {
      if (props.inputType) {
        const targetRef = e.target.querySelector('input') || e.target.querySelector('select') || null
        const val = targetRef ? targetRef.value : null
        return emit('click', e, val, targetRef);
      }
      emit('click', e);
    }
    const onInputClick = (e) => { e.stopPropagation(); e.preventDefault(); }
    return () => {
      return (
        <button class="custom-btn" onClick={onClick}>
          {slots.default ? slots.default() : ''}
          {props.inputType ? (<inputCom onClick={onInputClick} {...props.slotProps} type={props.inputType} />) : null}
        </button>
      )
    }
  },
})

const controlItem = defineComponent({
  props: {
    label: { type: String, default: '' },
    labelValue: { type: String | Number, default: '' },
    modelValue: { type: String | Number | Boolean, default: '' },
    inputType: { type: String, default: '' },
    slotProps: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const onUpdateValue = (value) => {
      emit('update:modelValue', value);
    }
    return () => {
      try {
        return (<div class="control-item">
          <div class="control-label">
            <span>{props.label}</span>
            <span class="value-display">{slots.value ? slots.value() : (props.labelValue || `${props.modelValue}`)}</span>
          </div>
          {slots.default ? slots.default() : (<inputCom {...props.slotProps} modelValue={props.modelValue} type={props.inputType} onUpdate:modelValue={onUpdateValue} />)}
        </div>)
      } catch (error) {
        console.error('error', error);
      }
    }
  },
})

const codeCopyContent = defineComponent({
  props: {
    code: { type: String, default: '' },
    title: { type: String, default: '示例' },
  },
  setup(props, { slots, emit }) {
    const { copied, onCopyClick } = useCopyCode()
    return () => {
      return (
        <div class="code-section">
          {props.title ? (<h4>{props.title}</h4>) : null}
          <div class="code-container">
            <pre><code>{props.code}</code></pre>
            <button onClick={() => onCopyClick(props.code)} class={'copy-button' + ` ${copied.value ? 'copied' : ''}`}>
              {copied.value ? '✓ 已复制' : '📋 复制代码'}
            </button>
          </div>
        </div>
      )
    }
  },
})

const layoutCom = defineComponent({
  props: {
    title: { type: String, default: '' },
    titleLevel: { type: Number, default: 2 },
    type: { type: String, default: 'preview' }, // preview 预览 panel 控制器
    addLayerBtnList: { type: Array, default: () => [] },// {label: 'xx', key1: 'xx', key2: 'xx' ...... }
  },
  setup(props, { slots }) {
    return () => {
      return (
        <section class={`custom-layout custom-layout-${props.type}`}>
          {props.title ? (<div class="header-actions">
            {
              (() => {
                const titleLevelCom = `h${props.titleLevel}`
                return <titleLevelCom>{props.title}</titleLevelCom>
              })()
            }
            {
              props.addLayerBtnList.length ? (<div class="add-layer-wrap">
                {
                  props.addLayerBtnList.map((item, index) => (
                    <button key={index} class="add-layer-btn" onClick={(e) => item.callback && item.callback(e)}>{item.label}</button>
                  ))
                }
              </div>) : null
            }
            {slots.titleRight ? slots.titleRight() : null}
          </div>) : null}
          {slots.preview ? (<div class="preview-container">{slots.preview()}</div>) : null}
          {slots.code ? slots.code() : null}
          {slots.default ? (<div class="control-group">{slots.default()}</div>) : null}
        </section>
      )
    }
  },
})

const appContainer = defineComponent({
  props: {},
  setup(props, { slots }) {
    return () => {
      return (
        <div class="app-container">
          <main class="main-content">
            {slots.default ? slots.default() : null}
          </main>
          {slots.footer ? slots.footer() : null}
        </div>
      )
    }
  },
})

export default {
  useCopyCode,

  inputCom,
  selectCom,
  customBtnCom,
  codeCopyContent,
  controlItem,
  layoutCom,
  appContainer
}
</script>
<style lang="scss">
@use './async-demo/static/scss/theme.scss';

.select-control {
  display: inline-block;
  position: relative;

  .select-control {
    width: 100%;
    opacity: 0;
    z-index: 1;
    cursor: pointer;
    padding: $spacing-xs $spacing-md;

    &:hover+.select-control-btn {
      background-color: #ffffff;
      border-color: #c5c9d2;
    }

    &:focus+.select-control-btn {
      outline: none;
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.18);
      background-color: #ffffff;
    }

    &:disabled+.select-control-btn {
      cursor: not-allowed;
      opacity: 0.7;
      background-color: #f0f0f0;
      border-color: #e0e0e0;
    }
  }

  .select-control-btn {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    font-size: 14px;
    transition: all $transition-speed;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-xs $spacing-sm;
    border: 1px solid $medium-gray;
    border-radius: $border-radius;
    font-size: 14px;
    background: $light-gray;
    cursor: pointer;
    z-index: 0;
  }
}

.select-control select,
.number-control,
.text-control {
  padding: $spacing-xs $spacing-sm;
  border: 1px solid $medium-gray;
  border-radius: $border-radius;
  width: auto;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.checkbox-control {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.range-control {
  width: auto;
  height: 6px;
  margin: 6px 0;
  -webkit-appearance: none;
  appearance: none;
  background: darken($light-gray, 5%);
  border-radius: 3px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: $primary-color;
    cursor: pointer;
    transition: background $transition-speed;

    &:hover {
      background: darken($primary-color, 10%);
    }
  }
}

.custom-input-btn,
.custom-btn {
  @include button-shared;
  background-color: $light-gray;
  color: $dark-gray;
  gap: $spacing-sm;

  &:hover {
    background-color: $medium-gray;
  }
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  .control-label {
    display: flex;
    justify-content: space-between;
    font-size: 14px;

    span:first-child {
      font-weight: 500;
      color: $dark-gray;
      flex-shrink: 0;
    }

    .value-display {
      color: $primary-color;
      font-family: monospace;
      font-size: 13px;
      flex-shrink: 0;
    }
  }
}

.code-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  flex-shrink: 0;

  h4 {
    color: $dark-gray;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .code-container {
    @include control-shared;
    position: relative;
    background: #1e293b;
    padding: $spacing-md;
    box-shadow: $shadow-light;

    pre {
      margin: 0;
      color: #e2e8f0;
      font-size: 14px;
      overflow-x: auto;
      line-height: 1.5;
    }

    .copy-button {
      @include button-shared;
      position: absolute;
      top: $spacing-sm;
      right: $spacing-sm;
      background-color: $primary-color;
      color: white;
      gap: $spacing-xs;
      padding: $spacing-xs $spacing-sm;
      font-size: 13px;

      &:hover {
        background-color: darken($primary-color, 10%);
      }

      &.copied {
        background-color: $success-color;
      }
    }
  }
}

.custom-layout-panel {
  background-color: #fff;
  border-radius: $border-radius;
  padding: $spacing-lg;
  box-shadow: $shadow-light;
}

.custom-layout-preview {
  flex: 1;
}

.custom-layout {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  overflow: auto;

  .header-actions {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      color: $dark-gray;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      flex-shrink: 0;
    }

    h3 {
      color: $dark-gray;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      flex-shrink: 0;
    }

    h4 {
      color: $dark-gray;
      margin: 0;
      font-size: 14px;
      font-weight: 400;
      flex-shrink: 0;
    }

    .add-layer-wrap {
      display: flex;
      flex-shrink: 0;
      gap: $spacing-md;
      align-items: center;
      justify-content: center;

      .add-layer-btn {
        @include button-shared;
        background-color: $primary-color;
        color: white;

        &:hover {
          background-color: darken($primary-color, 10%);
        }
      }
    }
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .preview-container {
    @include control-shared;
    padding: $spacing-lg;
    box-shadow: $shadow-light;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    flex-shrink: 0;
    overflow: auto;
  }
}

.app-container {
  background-color: $light-gray;
  padding: $spacing-md;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  .main-content {
    height: calc(100vh - $spacing-md * 2);
    display: flex;
    gap: $spacing-lg;
    flex-shrink: 0;
  }
}
</style>