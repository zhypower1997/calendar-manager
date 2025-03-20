import { makeAutoObservable } from 'mobx';

class FeishuStore {
    sheetToken = '';
    inputSheetToken = '';
    defaultToken = 'Efn1s9qYphcyditDNRdccffCnKd';

    constructor() {
        makeAutoObservable(this);
    }

    setSheetToken = (token: string) => {
        this.sheetToken = token;
    }

    setInputSheetToken = (token: string) => {
        this.inputSheetToken = token;
    }

    initializeToken = () => {
        // 优先从 URL 获取
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get('sheetToken');
            if (tokenFromUrl) {
                this.sheetToken = tokenFromUrl;
                this.inputSheetToken = tokenFromUrl;
                return;
            }
        }
        // 如果 URL 中没有，使用默认值
        this.sheetToken = this.defaultToken;
        this.inputSheetToken = this.defaultToken;
    }
}

const feishuStore = new FeishuStore();
export default feishuStore;
