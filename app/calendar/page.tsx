/* eslint-disable no-plusplus */
'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Input, Modal, message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { CloseCircleOutlined } from '@ant-design/icons';
import { SketchPicker as ColorPicker } from 'react-color';
import locale from '@fullcalendar/core/locales/zh-cn';
import FullCalendar, {
  DateSelectArg,
  EventContentArg,
} from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import styles from '@/app/ui/calendar.module.css';
import '@/app/ui/calendar.css';
import feishuStore from '@/app/store/feishu';
const createEventId = () => {
  return uuidv4();
};

export default observer(function IndexPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isClient, setIsClient] = useState(false)
  const { sheetToken } = feishuStore;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [color, setColor] = useState('#E6EEFF');
  const [clickInfoItem, setClickInfoItem] = useState<EventContentArg>();
  const [selectItemInfo, setSelectItemInfo] = useState<DateSelectArg>();

  const [value, setValue] = useState('');
  const [isChange, setIsChange] = useState(false);
  const [initEvent, setInitEvent] = useState([]);

  useEffect(() => {
    setIsClient(true);
    // 初始化时获取 token
    feishuStore.initializeToken();
  }, []);

  useEffect(() => {
    if (!sheetToken) return;
    // 页面加载时从飞书获取数据
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `/apis/get-feishu-excel?sheetToken=${sheetToken}`,
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setInitEvent(data);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        setInitEvent([])
        messageApi.error('获取数据失败');
      }
    };

    fetchEvents();
  }, [sheetToken]);

  const handleDateSelect = (selectInfo: any) => {
    setValue('');
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
          backgroundColor: done ? '#eee' : 'transparent',
        }}
        className={styles.content}
      >
        <input
          className={styles.input}
          type="checkbox"
          checked={done}
          onChange={() => {
            eventInfo.event.setExtendedProp('done', !done);
          }}
        />
        <span
          style={{
            textDecoration: done ? 'line-through' : 'none',
            width: '100%',
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
              color: done ? '#eee' : eventInfo.event.backgroundColor,
              filter: 'grayscale(1) contrast(999) invert(1)',
              textDecoration: done ? 'line-through' : 'none',
              width: '100%',
              whiteSpace: 'break-spaces',
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
          <CloseCircleOutlined style={{ fontSize: 12, color: '#fff' }} />
        </span>
      </div>
    );
  };

  const handleEvents = async (events: any) => {
    if (events.length === 0) {
      return;
    }

    try {
      await fetch(`/apis/save-feishu-excel?sheetToken=${sheetToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueRange: {
            range: 'sheetId!A2:T2000', // 根据实际表格范围调整
            values: events.map((event: any) => [
              event.title,
              dayjs(event.start).format('YYYY-MM-DD'),
              dayjs(event.end).format('YYYY-MM-DD'),
              event.id,
              event.backgroundColor,
              String(event.extendedProps?.done),
            ]),
          },
        }),
      });
    } catch (error) {
      console.error('保存数据失败:', error);
      messageApi.error('保存数据失败');
    }
  };

  const updateUrlQuery = (token: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('sheetToken', token);
      window.history.pushState({}, '', url);
    }
  };

  return (
    <>
    {contextHolder}
      <div className={styles.tokenWrap}>
        <Input
          className={styles.tokenInput}
          value={feishuStore.inputSheetToken}
          onChange={(e: any) => {
            feishuStore.setInputSheetToken(e.target.value);
          }}
        />
        <div
          className={styles.tokenBtn}
          onClick={() => {
            const newToken = feishuStore.inputSheetToken;
            feishuStore.setSheetToken(newToken);
            updateUrlQuery(newToken);
          }}
        >
          确定拉取文档
        </div>
      </div>
      {/* 仅在客户端渲染 */}
      {isClient && <div className={styles.dateWrap}>
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
            if (value === '') {
              messageApi.info('请输入内容');
              return;
            }
            setIsModalOpen(false);
            if (isChange) {
              clickInfoItem?.event.setProp('title', value);
              clickInfoItem?.event.setProp('backgroundColor', color);
            } else if (value) {
              value.split(' ').forEach((item) => {
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
                '#eee',
                '#B5C0A1',
                '#A1BEC0',
                '#A1A5C0',
                '#C0A1BA',
                '#C0A1A1',
              ]}
              onChange={(c) => {
                setColor(c.hex);
              }}
            />
          </div>
        </Modal>
      </div>}
    </>
  );
});
