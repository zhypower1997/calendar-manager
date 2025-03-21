import { makeAutoObservable } from 'mobx';
import dayjs from 'dayjs';
import axios from 'axios';

class FeishuStore {
    sheetToken = 'Efn1s9qYphcyditDNRdccffCnKd';
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

    async fetchEvents() {
        this.setCalendarDataLoading(true);
        try {
            const response = await axios.get(`/apis/get-feishu-excel?sheetToken=${this.sheetToken}`);
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
        this.setCalendarDataLoading(true);
        try {
            await axios.put(`/apis/save-feishu-excel?sheetToken=${this.sheetToken}`, {
                valueRange: {
                    range: "sheetId!A2:T2000",
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
        } finally {
            this.setCalendarDataLoading(false);
        }
    }
}

const feishuStore = new FeishuStore();
export default feishuStore;
