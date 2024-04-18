## 统一管理ref引用

使用示例
```javascript
const [listItemRefs, setListItemRefs] = useRefs();
const handleClick = (row, index) => {
    listItemRefs[index].customKey = `${row}-牛皮666`
}
return (
    <custom-list>
        {
            ['a', 'b', 'c', 'd'].map((item, index) => (
                <custom-list-item
                    key={index}
                    ref={setMonthRefs(index)}
                    onClick={() => handleClick(row, index)}/>
            ))
        }
    </custom-list>
)
```