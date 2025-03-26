/* eslint-disable no-plusplus */
"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Input, Modal, message, Spin } from "antd";
import { v4 as uuidv4 } from "uuid";
import { CloseCircleOutlined } from "@ant-design/icons";
import { SketchPicker as ColorPicker } from "react-color";
import locale from "@fullcalendar/core/locales/zh-cn";
import FullCalendar, {
  DateSelectArg,
  EventContentArg,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "@/app/ui/dashboard/calendar.module.css";
import "@/app/ui/dashboard/calendar.css";
import feishuStore from "@/app/store/feishu";
const createEventId = () => {
  return uuidv4();
};

export default observer(function IndexPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isClient, setIsClient] = useState(false);
  const { calendarDataLoading, events } = feishuStore;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [color, setColor] = useState("#E6EEFF");
  const [clickInfoItem, setClickInfoItem] = useState<EventContentArg>();
  const [selectItemInfo, setSelectItemInfo] = useState<DateSelectArg>();
  const [value, setValue] = useState("");
  const [isChange, setIsChange] = useState(false);
  const userId = 'ss2';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    feishuStore.fetchSheetId(userId).then(()=>{
      feishuStore.fetchEvents().catch(() => {
        messageApi.error("获取数据失败");
      });
    }).catch(() => {
      messageApi.error("获取数据失败");
    });

  }, []);

  const handleDateSelect = (selectInfo: any) => {
    setValue("");
    setIsModalOpen(true);
    setSelectItemInfo(selectInfo);
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };
  const handleEventClick = (clickInfo: any) => {
    if (!clickInfo.event.extendedProps.done) {
      setIsModalOpen(true);
      setIsChange(true);
      setClickInfoItem(clickInfo);
      setValue(clickInfo.event.title);
    }
  };
  const renderEventContent = (eventInfo: any) => {
    const { done } = eventInfo.event.extendedProps;

    return (
      <div
        style={{
          backgroundColor: done ? "#eee" : "transparent",
        }}
        className={styles.content}
      >
        <input
          className={styles.input}
          type="checkbox"
          checked={done}
          onChange={() => {
            eventInfo.event.setExtendedProp("done", !done);
          }}
        />
        <span
          style={{
            textDecoration: done ? "line-through" : "none",
            width: "100%",
          }}
        >
          {eventInfo.timeText && (
            <b style={{ marginRight: 4 }}>{eventInfo.timeText}</b>
          )}
          <span
            onClick={() => {
              handleEventClick(eventInfo);
            }}
            style={{
              color: done ? "#eee" : eventInfo.event.backgroundColor,
              filter: "grayscale(1) contrast(999) invert(1)",
              textDecoration: done ? "line-through" : "none",
              width: "100%",
              whiteSpace: "break-spaces",
            }}
          >
            {eventInfo.event.title}
          </span>
        </span>
        <span
          onClick={() => {
            eventInfo.event.remove();
          }}
        >
          <CloseCircleOutlined style={{ fontSize: 12, color: "#fff" }} />
        </span>
      </div>
    );
  };

  const handleEvents = async (events: any) => {
    if (events.length === 0) {
      return;
    }

    try {
      await feishuStore.saveEvents(events);
    } catch (error) {
      messageApi.error("保存数据失败");
    }
  };

  return (
    <Spin spinning={calendarDataLoading} style={{maxHeight: "100vh"}}>
      {contextHolder}
      {isClient && (
        <div className={styles.dateWrap}>
          <div className={styles.fullCalendar}>
            <FullCalendar
              locale={locale}
              eventColor="transparent"
              eventBorderColor="transparent"
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              views={{
                dayGridMonth: {
                  dayCellContent(item) {
                    return (
                      <>
                        <label className={styles.text}>
                          {item.date.getDate()}
                        </label>
                      </>
                    );
                  },
                },
              }}
              initialView="dayGridMonth"
              editable
              selectable
              selectMirror
              dayMaxEvents
              weekends
              events={events}
              select={handleDateSelect}
              eventContent={renderEventContent}
              eventsSet={handleEvents}
            />
          </div>
          <Modal
            title="待办"
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setIsChange(false);
            }}
            onOk={() => {
              if (value === "") {
                messageApi.info("请输入内容");
                return;
              }
              setIsModalOpen(false);
              if (isChange) {
                clickInfoItem?.event.setProp("title", value);
                clickInfoItem?.event.setProp("backgroundColor", color);
              } else if (value) {
                value.split(" ").forEach((item) => {
                  selectItemInfo?.view.calendar.addEvent({
                    id: createEventId(),
                    title: item,
                    start: selectItemInfo.startStr,
                    end: selectItemInfo.endStr,
                    allDay: selectItemInfo.allDay,
                    extendedProps: { done: false },
                    backgroundColor: color,
                  });
                });
              }
              setIsChange(false);
            }}
            okText="确定"
            cancelText="取消"
          >
            <div className={styles.contentWrap}>
              <Input
                placeholder="请输入待办内容"
                value={value}
                onChange={(e: any) => setValue(e.target.value)}
              />
              <ColorPicker
                width="350px"
                color={color}
                presetColors={[
                  "#eee",
                  "#B5C0A1",
                  "#A1BEC0",
                  "#A1A5C0",
                  "#C0A1BA",
                  "#C0A1A1",
                ]}
                onChange={(c) => {
                  setColor(c.hex);
                }}
              />
            </div>
          </Modal>
        </div>
      )}
    </Spin>
  );
});
