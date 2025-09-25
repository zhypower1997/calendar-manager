import { NextResponse } from 'next/server';
import { COZE_TOKEN } from '../../../lib/constant';

const COZE_API_URL = 'https://api.coze.cn/v3/chat/retrieve';
const COZE_AUTH_TOKEN = COZE_TOKEN;


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    const chatId = searchParams.get('chat_id');

    if (!conversationId || !chatId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${COZE_API_URL}?conversation_id=${conversationId}&chat_id=${chatId}`,
      {
        headers: {
          'Authorization': `Bearer ${COZE_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: '获取对话详情失败' },
      { status: 500 }
    );
  }
}
