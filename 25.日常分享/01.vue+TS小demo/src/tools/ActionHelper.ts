import DataHelper from './DataHelper'
import itemData from '../model/itemData'
import CateEnum from "@/model/cateEnum";

class ActionHelper {
    dataHelper:DataHelper = new DataHelper('memoData','id');
    memoListArr:Array<itemData>;
    constructor(){
        this.memoListArr = this.readData()
    }
    getCategoryName(cateId:CateEnum):string{
        console.log(cateId);
        const arrName = ['工作','生活','学习'];
        return arrName[cateId]
    }
    // 读取信息
    readData():Array<itemData>{
        let arr = this.dataHelper.readData();
        return arr.map((element: any) => {
            let item: itemData = new itemData();
            item.id = element.id;
            item.cateId = element.cateId;
            item.title = element.title;
            item.content = element.content;
            item.createTime = element.createTime;
            return item
        })
    }
    // 新增信息
    addData(item:itemData):number{
        item.id = this.dataHelper.addData(item);
        this.memoListArr.push(item);
        this.dataHelper.saveData(this.memoListArr);
        return item.id
    }
    // 修改信息
    updateData(item:itemData):void{
        // @ts-ignore
        let updateObj: itemData | undefined = this.memoListArr.find((memo) =>{
            return memo.id === item.id
        });
        if(updateObj){
            updateObj.cateId = item.cateId;
            updateObj.title = item.title;
            updateObj.content = item.content;
        }
        this.dataHelper.saveData(this.memoListArr)
    }
    // 删除信息
    removeData(id:number):void{
        let index:number = this.memoListArr.findIndex((item) =>item.id === id);
        if(index !== -1){
            this.memoListArr.splice(index,1)
            this.dataHelper.saveData(this.memoListArr)
        }
    }
}
export default ActionHelper