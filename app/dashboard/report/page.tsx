'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import feishuStore from '@/app/store/feishu';
import { observer } from 'mobx-react';

interface ChatMessage {
  bot_id: string;
  chat_id: string;
  content: string;
  content_type: string;
  conversation_id: string;
  created_at: number;
  id: string;
  role: string;
  type: string;
  updated_at: number;
}

interface ChatResponse {
  code: number;
  data: {
    conversation_id: string;
    id: string;
    status: string;
  };
}

interface MessagesResponse {
  code: number;
  data: ChatMessage[];
}

const ReportPage = observer(() => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // 格式化事件数据
      const eventsString = feishuStore.events.map(event =>
        `${event.title} ${event.start} ${event.end} ${event.id} ${event.backgroundColor} ${event.extendedProps?.done}`
      ).join(' ');

      // 1. 发起对话
      const chatResponse = await axios.post<ChatResponse>('/apis/coze-chat/start-chat', {
        bot_id: "7493069877880995840",
        user_id: "123",
        stream: false,
        auto_save_history: true,
        additional_messages: [
          {
            content_type: "text",
            role: "user",
            type: "question",
            content: `这个是我今年做的事情，请帮我生成述职文档。title start end id backgroundColor done ${eventsString}`
          }
        ]
      });

      if (chatResponse.data.code !== 0) {
        throw new Error('发起对话失败');
      }

      const { conversation_id, id } = chatResponse.data.data;

      // 2. 轮询检查对话状态
      let completed = false;
      let retryCount = 0;
      const maxRetries = 30; // 最多轮询30次

      while (!completed && retryCount < maxRetries) {
        const statusResponse = await axios.get(`/apis/coze-chat/get-chat-detail`, {
          params: {
            conversation_id,
            chat_id: id
          }
        });

        if (statusResponse.data.code === 0 && statusResponse.data.data.status === 'completed') {
          completed = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 每2秒检查一次
          retryCount++;
        }
      }

      if (!completed) {
        throw new Error('生成超时');
      }

      // 3. 获取对话消息列表
      const messagesResponse = await axios.get<MessagesResponse>(`/apis/coze-chat/get-chat-messages`, {
        params: {
          conversation_id,
          chat_id: id
        }
      });

      if (messagesResponse.data.code !== 0) {
        throw new Error('获取消息失败');
      }

      // 找到类型为 answer 的助手回复
      const assistantMessage = messagesResponse.data.data?.find(
        msg => msg.role === 'assistant' && msg.type === 'answer'
      );

      if (assistantMessage) {
        setResult(assistantMessage.content);
      } else {
        throw new Error('未找到有效的回复内容');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成报告失败');
    } finally {
      setLoading(false);
    }
  };

   // 判断是否window
   const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('calendar-user') || '{}') : null;
   const userId = user?.userId;
   if (!userId) {
    router.push('/user/login');
  }

  // 组件加载时获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!feishuStore.sheetId) {
          await feishuStore.fetchSheetId(userId); // 替换成实际的用户ID
        }
        await feishuStore.fetchEvents();
      } catch (err) {
        setError('获取日历数据失败');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">述职报告生成器</h1>

      <button
        onClick={generateReport}
        disabled={loading || feishuStore.calendarDataLoading || feishuStore.events.length === 0}
        className={`px-6 py-3 rounded-lg ${
          loading || feishuStore.calendarDataLoading || feishuStore.events.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-medium transition-colors`}
      >
        {loading ? '正在生成报告...' :
         feishuStore.calendarDataLoading ? '正在加载数据...' :
         feishuStore.events.length === 0 ? '无可用数据' :
         '生成述职报告'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">错误：{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">生成的述职报告：</h2>
          <div className={`prose prose-slate lg:prose-lg max-w-none`}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold my-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold my-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold my-2">{children}</h3>,
                h4: ({ children }) => <h4 className="text-lg font-bold my-2">{children}</h4>,
                ul: ({ children }) => <ul className="list-disc pl-6 my-2">{children}</ul>,
                li: ({ children }) => <li className="my-1">{children}</li>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
              }}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              复制内容
            </button>
            <button
              onClick={() => {
                const blob = new Blob([result], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '述职报告.md';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              下载 Markdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ReportPage;
