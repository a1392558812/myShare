<script lang="jsx">
import { ref } from 'vue'
import { isObject, isDOMRect, isArray, isString, isNumber, isBoolean, isNull, isUndefined } from '../../static/hooks/type.js'
const getTypeClass = (value) => {
  if (isNull(value) || isUndefined(value)) return 'je-val-null'
  if (isDOMRect(value)) return 'je-val-domrect'
  if (isString(value)) return 'je-val-string'
  if (isNumber(value)) return 'je-val-number'
  if (isBoolean(value)) return 'je-val-boolean'
  return 'je-val-other'
}

const coerceType = (oldVal, raw, inputType) => {
  if (isNumber(oldVal) || inputType === 'number') {
    const n = Number(raw)
    return Number.isNaN(n) ? oldVal : n
  }
  if (isBoolean(oldVal) || inputType === 'checkbox') {
    return !!raw
  }
  if (isNull(oldVal) || isUndefined(oldVal)) {
    return String(raw)
  }
  return String(raw)
}

const defaultProps = () => ({
  value: {
    type: null,
    default: undefined,
  },
  fatherKey: {
    type: String,
    default: "-1",
  },
  valueKey: {
    type: String,
    default: "",
  },
  collapsible: {
    type: Boolean,
    default: true,
  },
  defaultCollapsed: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  path: {
    type: Array,
    default: () => [],
  }
});
export default {
  name: 'JsonEditor',
  props: defaultProps(),
  setup(props, { emit }) {
    const collapsed = ref(props.defaultCollapsed)
    const toggleCollapsed = () => {
      if (!props.collapsible) return
      collapsed.value = !collapsed.value
    }
    const emitEdit = ({ path, oldValue, newValue }) => {
      console.log('emitEdit', path, oldValue, newValue)
      emit('edit', { path, oldValue, newValue })
    }

    const pathForChildUpdate = (key) => {
      const base = [...props.path]
      return isObject(props.value) ? [...base, key] : base
    }

    const onTextBlur = (e, key, oldValue) => {
      if (!props.editable) return
      const raw = e.target.value
      const newValue = coerceType(oldValue, raw, 'text')
      const path = pathForChildUpdate(key)
      emitEdit({ path, oldValue, newValue })
    }

    const onNumberBlur = (e, key, oldValue) => {
      if (!props.editable) return
      const raw = e.target.value
      const newValue = coerceType(oldValue, raw, 'number')
      const path = pathForChildUpdate(key)
      emitEdit({ path, oldValue, newValue })
    }

    const onBooleanChange = (e, key, oldValue) => {
      if (!props.editable) return
      const raw = e.target.checked
      const newValue = coerceType(oldValue, raw, 'checkbox')
      const path = pathForChildUpdate(key)
      emitEdit({ path, oldValue, newValue })
    }

    const keydownEnterToBlur = (e) => {
      if (e.key === 'Enter') e.target.blur()
    }

    const leafLabelFromPath = () => {
      if (props.valueKey) return props.valueKey
      const len = props.path?.length || 0
      return len ? `[${props.path[len - 1]}]` : 'value'
    }

    const stopEvent = (event) => {
      event?.stopPropagation?.()
      event?.preventDefault?.()
    }

    const emitAdd = (data) => {
      emit('add', data)
    }

    const emitDelete = (data) => {
      emit('delete', data)
    }

    const addObjectKey = () => {
      if (!props.editable) return
      if (!isObject(props.value)) return
      const base = 'newKey'
      let idx = 1
      let nextKey = base
      const keys = Object.keys(props.value)
      while (keys.includes(nextKey)) {
        idx += 1
        nextKey = `${base}${idx}`
      }
      emitAdd({ path: props.path, key: nextKey, value: null })
    }

    const addArrayItem = () => {
      if (!props.editable) return
      if (!isArray(props.value)) return
      emitAdd({ path: props.path, value: null })
    }

    const deleteSelf = () => {
      if (!props.editable) return
      const pathLength = props.path?.length || 0
      if (!pathLength) return
      const last = props.path[pathLength - 1]
      const parentPath = props.path.slice(0, pathLength - 1)
      if (typeof last === 'number') {
        emitDelete({ path: parentPath, index: last })
      } else {
        emitDelete({ path: parentPath, key: last })
      }
    }

    const deleteLeaf = (key) => {
      if (!props.editable) return
      emitDelete({ path: props.path, key })
    }

    const typeKeyOfValue = (val) => {
      if (isArray(val)) return 'array'
      if (isUndefined(val) || isNull(val)) return 'undefined'
      if (isBoolean(val)) return 'boolean'
      if (isNumber(val)) return 'number'
      if (isString(val)) return 'string'
      return 'object'
    }

    const newValueOfType = (typeKey) => {
      switch (typeKey) {
        case 'boolean': return true
        case 'string': return ''
        case 'number': return 0
        case 'undefined': return undefined
        case 'object': return {}
        case 'array': return []
        default: return undefined
      }
    }

    const renameObjectKey = (oldKey, newKey) => {
      if (!props.editable) return
      if (!isObject(props.value)) return
      const trimmed = String(newKey || '').trim()
      if (!trimmed || trimmed === oldKey) return
      const hasDup = Object.prototype.hasOwnProperty.call(props.value, trimmed)
      if (hasDup) return
      const oldValue = props.value
      const cloned = { ...oldValue }
      cloned[trimmed] = cloned[oldKey]
      delete cloned[oldKey]
      const path = [...props.path]
      emitEdit({ path, oldValue, newValue: cloned })
    }

    const onKeyRenameBlur = (e, oldKey) => {
      const next = e?.target?.value
      renameObjectKey(oldKey, next)
    }

    const onSelfKeyRenameBlur = (e) => {
      if (!props.editable) return
      const oldKey = props.valueKey
      const next = String(e?.target?.value ?? '').trim()
      if (!oldKey || !next || next === oldKey) return
      const parentPath = props.path.slice(0, Math.max(0, props.path.length - 1))
      emitAdd({ path: parentPath, key: next, value: props.value })
      emitDelete({ path: parentPath, key: oldKey })
    }

    const changeLeafType = (key, typeKey) => {
      if (!props.editable) return
      const oldValue = props.value?.[key]
      const newValue = newValueOfType(typeKey)
      const path = [...props.path, key]
      emitEdit({ path, oldValue, newValue })
    }

    const changeSelfType = (typeKey) => {
      if (!props.editable) return
      const oldValue = props.value
      const newValue = newValueOfType(typeKey)
      const path = [...props.path]
      emitEdit({ path, oldValue, newValue })
    }

    const onSelfTypeSelectChange = (event) => {
      stopEvent(event)
      const typeKey = event?.target?.value
      if (!typeKey) return
      changeSelfType(typeKey)
    }
    const onLeafTypeSelectChange = (key, event) => {
      stopEvent(event)
      const typeKey = event?.target?.value
      if (!typeKey) return
      changeLeafType(key, typeKey)
    }

    const selectNode = (key, currentValue) => {
      const selectRef = ref(null)
      return (<div class="je-type-select-container">
        <select
          ref={selectRef}
          class="je-type-actions je-type-select"
          value={typeKeyOfValue(currentValue)}
          onClick={stopEvent}
          onChange={(e) => {
            console.log('selectNode-change', e.target.value)
            if (key) {
              return onLeafTypeSelectChange(key, e)
            }
            onSelfTypeSelectChange(e)
          }}
          title="重置为指定类型">
          {
            [
              { value: 'boolean', label: 'Boolean【🐮】' },
              { value: 'string', label: 'String【🐮】' },
              { value: 'number', label: 'Number【🐮】' },
              { value: 'undefined', label: 'Undefined【🐮】' },
              { value: 'object', label: 'Object【🐮】' },
              { value: 'array', label: 'Array【🐮】' }
            ].map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))
          }
        </select>
        <button class="je-type-select-filed">切换数据类型【{typeKeyOfValue(currentValue)}】</button>
      </div>)
    }

    /**
      <div class="je-leaf" key={`${this.fatherKey}-${index}`}>
        {
          this.editable ? (
            <input
              class="je-input je-key-input"
              type="text"
              value={String(key)}
              onKeydown={this.keydownEnterToBlur}
              onBlur={(e) => this.onKeyRenameBlur(e, key)}
              title="编辑键名后回车或失焦重命名"
            />
          ) : (
            <span class="je-key">{key}</span>
          )
        }
        <span class="je-colon">:</span>
        {
          this.editable ? ((() => {
            const node = isBoolean(childValue) ? (
              <input class="je-input je-input-boolean" type="checkbox" checked={!!childValue} onChange={(e) => this.onBooleanChange(e, key, childValue)} />
            ) : isNumber(childValue) ? (
              <input class="je-input je-input-number" type="number" value={String(childValue)} onKeydown={this.keydownEnterToBlur} onBlur={(e) => this.onNumberBlur(e, key, childValue)} />
            ) : (
              <input class="je-input" type="text" value={String(childValue)} onKeydown={this.keydownEnterToBlur} onBlur={(e) => this.onTextBlur(e, key, childValue)} />
            )

            return <Fragment>
              {node}
              {this.selectNode(key)}
              <button class="je-action danger" onClick={(e) => { this.stopEvent(e); this.deleteLeaf(key) }} title="删除该键">🗑</button>
            </Fragment>
          })()) : (<span class={`je-value ${getTypeClass(childValue)}`}>{String(childValue)}</span>)
        }
      </div>
     */
    const valueNode = ({ key, childValue }) => {
      return (<Fragment>
        <span class="je-colon">:</span>
        {
          props.editable ? ((() => {
            const node = isBoolean(childValue) ? (
              <input
                class="je-input je-input-boolean"
                type="checkbox"
                checked={!!childValue}
                onChange={(e) => onBooleanChange(e, key, childValue)} />
            ) : isNumber(childValue) ? (
              <input
                class="je-input je-input-number"
                type="number"
                value={String(childValue)}
                onKeydown={keydownEnterToBlur}
                onBlur={(e) => onNumberBlur(e, key, childValue)} />
            ) : (
              <input
                class="je-input"
                type="text"
                value={String(childValue)}
                onKeydown={keydownEnterToBlur}
                onBlur={(e) => onTextBlur(e, key, childValue)} />
            )

            return <Fragment>
              {node}
              {(isObject(props.value) || isArray(props.value)) ? selectNode(key, childValue) : selectNode(undefined, props.value)}
              <button class="je-action danger" onClick={(e) => { stopEvent(e); deleteLeaf(key) }} title="删除该键">🗑</button>
            </Fragment>
          })()) : (<span class={`je-value ${getTypeClass(childValue)}`}>{String(childValue)}</span>)
        }
      </Fragment>
      )
    }

    const editKeyNode = (key) => {
      return (props.editable ? (
        <input
          class="je-input je-key-input"
          type="text"
          value={String(key)}
          onKeydown={keydownEnterToBlur}
          onBlur={(e) => onKeyRenameBlur(e, key)}
          title="编辑键名后回车或失焦重命名"
        />
      ) : (
        <span class="je-key">{key}</span>
      ))
    }

    const ObjOrArrKeyNode = (slotFun) => {
      return (
        props.valueKey ? (
          props.editable ? (
            <input
              class="je-input je-key-input je-key-input--header"
              type="text"
              value={String(props.valueKey)}
              onClick={stopEvent}
              onKeydown={keydownEnterToBlur}
              onBlur={onSelfKeyRenameBlur}
              title="编辑键名后回车或失焦重命名"
            />
          ) : (
            <span class="je-key">{props.valueKey}</span>
          )
        ) : slotFun()
      )
    }

    const errorNode = (value) => {
      return (
        <div class="je-error">错误的数据类型【{typeof value}】</div>
      )
    }

    return {
      collapsed,
      toggleCollapsed,
      onTextBlur,
      onNumberBlur,
      onBooleanChange,
      keydownEnterToBlur,
      leafLabelFromPath,
      stopEvent,
      selectNode,
      valueNode,
      editKeyNode,
      ObjOrArrKeyNode,
      errorNode,

      addObjectKey,
      addArrayItem,

      deleteSelf,
      deleteLeaf,

      onKeyRenameBlur,
      onSelfKeyRenameBlur,

      changeLeafType,
      changeSelfType,
      onSelfTypeSelectChange,
      onLeafTypeSelectChange,

      emitEdit,
      emitAdd,
      emitDelete,
    }
  },
  render() {
    const isArr = isArray(this.value)
    const isObj = isObject(this.value)
    const isPrim = !(isArr || isObj)
    const isDR = isDOMRect(this.value)

    if (isDR) {
      try {
        return (
          <div class="json-editor">
            <div class="je-domrect">
              <div class="je-domrect-header" onClick={this.toggleCollapsed} role="button" title="展开/折叠">
                {this.collapsible ? (<i class={`je-caret ${this.collapsed ? 'collapsed' : ''}`}></i>) : null}
                <span class="je-domrect-title">{this.valueKey}</span>
                <span class="je-summary">【{Object.prototype.toString.call(this.value).slice(8, -1)}】</span>
                <span class="je-colon">:</span>
                {this.collapsed ? (
                  <span class="je-summary overflow-ellipsis-1">{(() => {
                    console.log('isDR', this.value, (Object.keys(this.value)))
                    const keyToValue = []
                    for (let key in this.value) {
                      let targetValue = ''
                      try {
                        targetValue = String(Reflect.get(this.value, key))
                      } catch (error) {
                        targetValue = typeof Reflect.get(this.value, key)
                      }
                      keyToValue.push(`${key}:${targetValue}`)
                    }
                    return keyToValue.join(', ')
                  })()
                  }</span>
                ) : null}
                {this.editable && this.path?.length ? (
                  <button
                    class="je-action danger"
                    onClick={(e) => {
                      this.stopEvent(e);
                      this.deleteSelf()
                    }} title="删除该项">🗑</button>
                ) : null}
              </div>
              {!this.collapsed ? (
                <div class="je-children">
                  {(() => {
                    const nodeList = []
                    for (let key in this.value) {
                      let targetValue = ''
                      try {
                        targetValue = String(this.value[key])
                      } catch (error) {
                        targetValue = typeof this.value[key]
                      }
                      nodeList.push(<div class="je-leaf" key={`${this.fatherKey}-domrect-${key}`}>
                        <span class="je-key">{key}</span>
                        <span class="je-colon">:</span>
                        <span class={`je-value ${getTypeClass(this.value[key])}`}>{targetValue}</span>
                      </div>)
                    }
                    return nodeList
                  })()
                  }
                </div>
              ) : null}
            </div>
          </div>
        )
      } catch (error) {
        console.log('isDR error', error)
        return (this.errorNode(this.value))
      }
    }

    if (isPrim) {
      const value = this.value
      const label = this.leafLabelFromPath()
      return (
        <div class="json-editor">
          <div class="je-leaf">
            <span class="je-key">{label}</span>
            {this.valueNode({ key: label, childValue: value })}
          </div>
        </div>
      )
    }

    return (
      <div class="json-editor">
        {
          isArr ? (
            <div class="je-array">
              <div class="je-array-header" onClick={this.toggleCollapsed} role="button" title="展开/折叠">
                {this.collapsible ? (<i class={`je-caret ${this.collapsed ? 'collapsed' : ''}`}></i>) : null}
                {this.ObjOrArrKeyNode(() => null)}
                {this.valueKey ? (<span class="je-colon">:</span>) : null}
                <span class="je-array-title">Array[{this.value.length}]</span>
                {this.editable ? (
                  <>
                    <button
                      class="je-action"
                      onClick={(e) => {
                        this.stopEvent(e);
                        this.addArrayItem()
                      }} title="新增项">＋</button>
                    {this.selectNode(undefined, this.value)}
                    {this.path?.length ? (
                      <button
                        class="je-action danger"
                        onClick={(e) => {
                          this.stopEvent(e);
                          this.deleteSelf()
                        }} title="删除该项">🗑</button>
                    ) : null}
                  </>
                ) : null}
              </div>
              {!this.collapsed ? (
                <div class="je-children">
                  {
                    this.value.map((item, index) => {
                      return (<div class="je-item" key={`${this.fatherKey}-${index}`}>
                        <JsonEditor
                          value={item}
                          fatherKey={`${this.fatherKey}-${index}`}
                          collapsible={this.collapsible}
                          defaultCollapsed={this.defaultCollapsed}
                          editable={this.editable}
                          path={[...this.path, index]}
                          onEdit={(paramsData) => {
                            console.log('onEdit', paramsData)
                            this.emitEdit(paramsData)
                          }}
                          onAdd={this.emitAdd}
                          onDelete={this.emitDelete}
                        />
                      </div>
                      )
                    })
                  }
                </div>
              ) : null}
            </div>
          ) : isObj ? (
            <div class="je-object">
              <div class="je-label"
                onClick={this.toggleCollapsed}
                role="button"
                title="展开/折叠">
                {this.collapsible ? (<i class={`je-caret ${this.collapsed ? 'collapsed' : ''}`}></i>) : null}
                {this.ObjOrArrKeyNode(() => (<span class="je-key">Object</span>))}
                <span class="je-colon">:</span>
                {this.collapsed ? (<span class="je-summary">{'{'}{Object.keys(this.value).length}{'}'}</span>) : null}
                {this.editable ? (
                  <>
                    <button
                      class="je-action"
                      onClick={(e) => {
                        this.stopEvent(e);
                        this.addObjectKey()
                      }} title="新增键值">＋</button>
                    {this.selectNode(undefined, this.value)}
                    {this.path?.length ? (
                      <button
                        class="je-action danger"
                        onClick={(e) => {
                          this.stopEvent(e);
                          this.deleteSelf()
                        }} title="删除该项">🗑</button>
                    ) : null}
                  </>
                ) : null}
              </div>
              {!this.collapsed ? (
                <div class="je-children">
                  {
                    Object.keys(this.value).map((key, index) => {
                      const childValue = this.value[key]
                      if (isArray(childValue) || isObject(childValue) || isDOMRect(childValue)) {
                        return (
                          <div class="je-item" key={`${this.fatherKey}-${index}`}>
                            <JsonEditor
                              value={childValue}
                              valueKey={key}
                              fatherKey={`${this.fatherKey}-${index}`}
                              collapsible={this.collapsible}
                              defaultCollapsed={this.defaultCollapsed}
                              editable={this.editable}
                              path={[...this.path, key]}
                              onEdit={(paramsData) => {
                                console.log('onEdit', paramsData)
                                this.emitEdit(paramsData)
                              }}
                              onAdd={this.emitAdd}
                              onDelete={this.emitDelete}
                            />
                          </div>
                        )
                      }
                      return (<div class="je-leaf" key={`${this.fatherKey}-${index}`}>
                        {this.editKeyNode(key)}
                        {this.valueNode({ key, childValue })}
                      </div>)
                    })
                  }
                </div>
              ) : null}
            </div>
          ) : this.errorNode(this.value)
        }
      </div>
    )
  }
}
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.json-editor {
  @include control-shared;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  color: #111827;

  .je-array,
  .je-object,
  .je-domrect {
    margin: $spacing-sm 0;
  }

  .je-array-header,
  .je-label,
  .je-domrect-header {
    display: inline-flex;
    align-items: baseline;
    gap: $spacing-xs;
    margin-bottom: $spacing-xs;
    cursor: pointer;
    user-select: none;
  }

  .je-array-title,
  .je-domrect-title {
    color: #374151;
  }

  .je-key {
    color: $primary-color;
    font-weight: 600;
  }

  .je-colon {
    color: rgba(0, 0, 0, 0.35);
    padding: 0 $spacing-xs;
  }

  .je-summary {
    color: #6b7280;
  }

  .je-caret {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 0 5px 8px;
    border-color: transparent transparent transparent rgba(0, 0, 0, 0.45);
    transform: rotate(90deg);
    transition: transform .2s ease;

    &.collapsed {
      transform: rotate(0deg);
    }
  }

  .je-children {
    border-left: 2px dashed rgba(0, 0, 0, 0.08);
    margin-left: $spacing-sm;
    padding-left: $spacing-sm;
  }

  .je-item {
    margin: $spacing-xs 0;
  }

  .je-leaf {
    display: flex;
    align-items: baseline;
    gap: $spacing-xs;
    margin: $spacing-xs 0;
  }

  .je-value {
    &.je-val-string {
      color: #0ea5e9;
    }

    &.je-val-number {
      color: #8b5cf6;
    }

    &.je-val-boolean {
      color: #22c55e;
    }

    &.je-val-null {
      color: #6b7280;
      font-style: italic;
    }

    &.je-val-domrect {
      color: #f59e0b;
      font-weight: 600;
    }

    &.je-val-other {
      color: #374151;
    }
  }

  .je-input {
    font-family: inherit;
    font-size: 0.95em;
    padding: 2px 6px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: $border-radius;
    background: #fff;
    color: inherit;
  }

  .je-input-number {
    width: 120px;
  }

  .je-input-boolean {
    transform: translateY(1px);
  }

  .je-input-number {
    width: 120px;
  }

  .je-key-input {
    width: 140px;
    font-weight: 600;
    color: $primary-color;
  }

  .je-input-boolean {
    transform: translateY(1px);
  }

  .je-error {
    color: #ef4444;
    font-weight: 600;
  }

  .je-action {
    font-family: inherit;
    font-size: 12px;
    padding: 2px 6px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: $border-radius;
    background: #fff;
    color: #374151;
    cursor: pointer;
  }

  .je-action.danger {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.4);
  }
}

.je-type-select-container {
  position: relative;
  cursor: pointer;

  .je-type-select {
    width: 100%;
    height: 100%;
    padding: 2px 26px 2px 10px;
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    cursor: pointer;

    &:hover+.je-type-select-filed {
      background-color: #ffffff;
      border-color: #c5c9d2;
    }

    &:focus+.je-type-select-filed {
      outline: none;
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.18);
      background-color: #ffffff;
    }

    &:disabled+.je-type-select-filed {
      cursor: not-allowed;
      opacity: 0.7;
      background-color: #f0f0f0;
      border-color: #e0e0e0;
    }

    option {
      font-size: 12px;
      color: $dark-gray;
      padding: $spacing-xs $spacing-sm;
      background-color: #ffffff;
      cursor: pointer;
    }

    option[value=''] {
      color: $secondary-color;
    }

    option:checked {
      background-color: $medium-gray;
      color: $primary-color;
    }
  }

  .je-type-select-filed {
    position: relative;
    min-width: 116px;
    padding: 2px 26px 2px 10px;
    font-size: 12px;
    border: 1px solid #d4d7de;
    border-radius: 6px;
    background-color: #f5f7fa;
    color: #606266;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    cursor: pointer;
    z-index: 1;
  }
}
</style>