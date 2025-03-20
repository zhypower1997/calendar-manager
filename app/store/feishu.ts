import { makeAutoObservable } from 'mobx';

class FeishuStore {
    sheetToken = 'Efn1s9qYphcyditDNRdccffCnKd';

    constructor() {
        makeAutoObservable(this);
    }
}

const feishuStore = new FeishuStore();
export default feishuStore;
