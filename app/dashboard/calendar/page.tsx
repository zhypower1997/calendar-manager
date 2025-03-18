/* eslint-disable no-plusplus */
"use client";
import React, { useEffect, useState } from "react";
import { Input, Modal, message } from "antd";
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
import styles from "@/app/ui/calendar.module.css";
import "@/app/ui/calendar.css";

let eventGuid = 0;

const createEventId = () => {
  return String(eventGuid++);
};

export default function IndexPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [color, setColor] = useState("#E6EEFF");
  const [clickInfoItem, setClickInfoItem] = useState<EventContentArg>();
  const [selectItemInfo, setSelectItemInfo] = useState<DateSelectArg>();

  const [value, setValue] = useState("");
  const [isChange, setIsChange] = useState(false);
  const [initEvent, setInitEvent] = useState([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem("fullCalendarInfo");
    if (storedEvents) {
      setInitEvent(JSON.parse(storedEvents));
    }
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
          <CloseCircleOutlined style={{ fontSize: 16, color: "#fff" }} />
        </span>
      </div>
    );
  };

  const handleEvents = (events: any) => {
    if (events.length === 0) {
      return;
    }
    localStorage.setItem("fullCalendarInfo", JSON.stringify(events));
  };
  return (
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
                    <label className={styles.text}>{item.date.getDate()}</label>
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
          events={initEvent}
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
            message.info("请输入内容");
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
  );
}
