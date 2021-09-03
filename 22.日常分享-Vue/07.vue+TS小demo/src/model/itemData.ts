import cateEnum from './cateEnum'
class ItemDate {
    id!: number;
    cateId!:cateEnum; // 分类id
    title!:string;
    content!:string;
    createTime!:string;
    constructor(id: number = -1,cateId:cateEnum = -1,title:string = '',content:string = ''){
        this.id = id;
        this.cateId = cateId;
        this.title = title;
        this.content = content;
        this.createTime = this.toSelfDataStr(Date.now())
    }
    toSelfDataStr(timeStr:number):string{
        // 将时间戳转为时间对象
        let date = new Date(timeStr);
        return date.getFullYear() + '年-' +
            (date.getMonth() + 1) + '月-' +
            date.getDate() + '日' + '   ' +
            date.getHours() + '时: ' +
            date.getMinutes() + '分'
    }
}
export default ItemDate