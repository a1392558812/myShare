## 组件传值
* props传值
* 使用第三方库
  * 下载依赖库 PubSubJs----`cnpm install pubsub-js --save`
## React新特性
* context
  * 让数据在组件树中不必一级一级传递,跨组件传值
  * createContext(defaultValue)唯一一种创建context实例的方法
  * createContext(defaultValue)可以使用多个，但是强烈建议只使用一个
* contextType
  * 通过使用contextType,可以简化Consumer组件
* lazy与Suspense
* memo
## hook
> 所有的useState-Hook都必须执行相同的次数，尽可能避免在for循环或者渲染的条件语句中调用useState-Hook
```js
// count类似于state中的值，setCount类似于setState,参数0,类似初始化state的count
 // useState允许接受一个回调函数，异步赋值，延迟初始化
const [count,setCount] = useState(() =>{
  console.log('const [count,setCount] = useState(() =>{}延迟初始化函数调用)')
  return props.count||0
})
```
* **不要在循环，条件或嵌套函数中调用 Hook，确保总是在你的 React 函数的最顶层调用他们**。遵守这条规则，
你就能确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 
状态的正确。
## useEffect
> 为什么要在 effect 中返回一个函数？ 这是 effect 可选的清除机制。每个 effect 都可以返回一个清除函数。
如此可以将添加和移除订阅的逻辑放在一起。它们都属于 effect 的一部分。
React 何时清除 effect？ React 会在组件卸载的时候执行清除操作。正如之前学到的，effect 在每次渲染的时候都会执行。
这就是为什么 React 会在执行当前 effect 之前对上一个 effect 进行清除 
## Memo与useMemo
* memo函数确定的是一个组件的渲染是否是重复执行
* useMemo函数确定的是一段函数是否重复执行
* 相同点，都是为了做性能优化使用
## Hook+Redux
* `redux-react-hook` 库帮助构建更好的Hook+redux
* `redux-thunk` 库实现异步action
* 看简书和github

## useMemo与useCallback使用指南
* useCallback和useMemo的参数跟useEffect一致，他们之间最大的区别有是useEffect会用于处理副作用，
  而useCallback和useMemo这两个hooks不能。
* useMemo和useCallback都会在组件第一次渲染的时候执行，之后会在其依赖的变量发生改变时再次执行；
  并且这两个hooks都返回缓存的值，useMemo返回**缓存的变量**，useCallback返回**缓存的函数**。