import { NextResponse } from 'next/server';
import { COZE_TOKEN } from '../../../lib/constant';

const COZE_API_URL = 'https://api.coze.cn/v3/chat';
const COZE_AUTH_TOKEN = COZE_TOKEN;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(COZE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: '发起对话失败' },
      { status: 500 }
    );
  }
}
