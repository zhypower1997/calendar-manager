import { makeAutoObservable } from 'mobx';
import dayjs from 'dayjs';
import axios from 'axios';

class FeishuStore {
    sheetToken = 'Efn1s9qYphcyditDNRdccffCnKd';
    sheetId = '';
    calendarDataLoading = false;
    events: any[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    setCalendarDataLoading(status: boolean) {
        this.calendarDataLoading = status;
    }

    setEvents(events: any[]) {
        this.events = events;
    }

    setSheetId(sheetId: string) {
        this.sheetId = sheetId;
    }

    async fetchSheetId(userId: string) {
        this.setCalendarDataLoading(true);
        const response = await axios.get(`/portfolio/apis/get-user-data?userId=${userId}`);
        this.setSheetId(response.data.sheetId);
    }

    async fetchEvents() {
        try {
            const response = await axios.get(`/portfolio/apis/get-feishu-excel?sheetToken=${this.sheetToken}&sheetId=${this.sheetId}`);
            if (Array.isArray(response.data)) {
                this.setEvents(response.data);
            }
        } catch (error) {
            console.error("获取数据失败:", error);
            this.setEvents([]);
            throw error;
        } finally {
            this.setCalendarDataLoading(false);
        }
    }

    async saveEvents(events: any[]) {
        try {
            await axios.put(`/portfolio/apis/save-feishu-excel?sheetToken=${this.sheetToken}&sheetId=${this.sheetId}`, {
                valueRange: {
                    // range: "sheetId!A2:T2000",
                    range: `${this.sheetId}!A2:T2000`,
                    values: events.map((event: any) => [
                        event.title,
                        dayjs(event.start).format("YYYY-MM-DD"),
                        dayjs(event.end).format("YYYY-MM-DD"),
                        event.id,
                        event.backgroundColor,
                        String(event.extendedProps?.done),
                    ]),
                },
            });
        } catch (error) {
            console.error("保存数据失败:", error);
            throw error;
        }
    }
}

const feishuStore = new FeishuStore();
export default feishuStore;
