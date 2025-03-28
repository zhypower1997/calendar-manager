'use client';
import { useRouter } from 'next/navigation';
import { Input, message, Form, Button } from 'antd';
import axios from 'axios';

export default function Page() {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const onFinish = async (values: any) => {
    try {
      const res = await axios.post('/apis/user/login', values);
      if (res.status === 200) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('calendar-user', JSON.stringify(res.data));
        }
        router.push('/dashboard/calendar');
      } else {
        messageApi.error('登录失败');
      }
    } catch (error) {
      messageApi.error(error?.response?.data?.error || '登录失败');
    }
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log(errorInfo);
  };
  return (
    <main className="flex justify-center items-center min-h-screen flex-col p-6">
      {contextHolder}
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center">
          <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input placeholder="请输入密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                登录
              </Button>
            </Form.Item>
          </Form>
          <button onClick={() => router.push('/user/register')}>
            我没有账号，我要注册
          </button>
        </div>
      </div>
    </main>
  );
}
