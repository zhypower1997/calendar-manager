import { makeAutoObservable } from 'mobx';

class FeishuStore {
    sheetToken = 'Efn1s9qYphcyditDNRdccffCnKd';
    inputSheetToken = '';

    constructor() {
        makeAutoObservable(this); // 这会自动设置所有属性和方法
    }

    setSheetToken = (token: string) => {
        console.log('Setting token:', token); // 调试日志
        this.sheetToken = token;
    }

    setInputSheetToken = (token: string) => {
        this.inputSheetToken = token;
    }
}

const feishuStore = new FeishuStore();
export default feishuStore;
