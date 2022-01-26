/* 自定义Promise */
(function (window) {
    const PENDING = 'pending'
    const RESOLVED = 'resolved'
    const REJECTED = 'rejected'
    function MyPromise(excutor) { //excutor 执行器函数
        const _this = this
        _this.status = PENDING // 给promise对象指定status属性，初始值为pending
        _this.data = 'undefined' // 指定用于存储数据结果的属性
        _this.callbacks = [] // 每个元素的结构{   onResolved(){},  onRejet(){}   }

        function resolve(value){
            if (_this.status !== PENDING) {
                return
            }
            _this.status = RESOLVED
            _this.data = value
            if (_this.callbacks.length>0) { // 有待执行的callback
                setTimeout(() =>{
                    _this.callbacks.forEach(callback =>{
                        callback.onResolved(value)
                    })
                })
            }
        }
        function reject(reason){
            if (_this.status !== PENDING) {
                return
            }
            _this.status = REJECTED
            _this.data = reason
            if (_this.callbacks.length>0) { // 有待执行的callback
                setTimeout(()=>{
                    _this.callbacks.forEach(callback =>{
                            callback.onRejected(reason)
                    })
                })
            }
        }


        try{
            excutor(resolve,reject)
        }catch (e) { // 执行器抛出异常
            reject(e)
        }

    }

    // 成功与失败的回调,返回一个新的promise对象

    MyPromise.prototype.then = function (onResolved,onRejected) {
        const _this = this
        onResolved = typeof onResolved ==='function' ? onResolved : value =>value
        onRejected = typeof onRejected ==='function' ? onRejected : reason =>{throw reason}
        return new MyPromise((resolve,reject)=>{
            function handleCallback(callback) { // 改变执行结果return的promise状态
                try {
                    const result = callback(_this.data)
                    if (result instanceof MyPromise) {
                        result.then(resolve,reject)
                    }else {
                        resolve(result)
                    }
                }catch (e) {
                    reject(e)
                }
            }
            if (_this.status ===PENDING) {
                _this.callbacks.push({
                    onResolved(){
                        handleCallback(onResolved)
                    },
                    onRejected(){
                        handleCallback(onRejected)
                    }
                })
            }else if (_this.status ===RESOLVED) { // resolved
                setTimeout(()=>{
                    handleCallback(onResolved)
                })
            }else{
                setTimeout(()=>{ // rejected
                    handleCallback(onRejected)
                })
            }
        }) // 返回一个新的promise对象
    }

    // 失败的回调,返回一个失败的promise对象
    MyPromise.prototype.catch = function (onRejected) {
        return this.then(undefined,onRejected)
    }

    // Promise函数对象实例的resolve方法，返回成功的promise
    MyPromise.resolve = function (value) {
        return new MyPromise((resolve,reject) =>{
            if (value instanceof MyPromise) {
                value.then(resolve,reject)
            }else {
                resolve(value)
            }
        })
    }

    // Promise函数对象实例的resolve方法，返回失败的promise
    MyPromise.reject = function (reason) {
        return new MyPromise((resolve,reject) =>{
            reject(reason)
        })
    }

    // Promise函数对象实例的方法，只有全部成功，才返回成功的promise
    MyPromise.all = function (promiseArr) {
        const resolveArr = new Array(promiseArr.length)
        let resolveNum = 0
        return new MyPromise((resolve,reject)=>{
            promiseArr.forEach((promise,index) =>{
                MyPromise.resolve(promise).then(
                    value => {
                        resolveNum++
                        resolveArr[index] = value
                        if (resolveNum === resolveArr.length) {
                            resolve(resolveArr)
                        }
                    },
                    reason => {
                        reject(reason)
                    }
                )
            })
        })
    }

    // 返回第一个完成的promise
    MyPromise.race = function (promiseArr) {
        return new MyPromise((resolve,reject) =>{
            promiseArr.forEach((promise,index) =>{
                MyPromise.resolve(promise).then(
                    value => {
                        resolve(value)
                    },
                    reason => {
                        reject(reason)
                    }
                )
            })
        })
    }

    window.MyPromise = MyPromise
})(window)