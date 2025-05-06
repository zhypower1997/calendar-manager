'use client';
import React from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Input, Form, Button, message } from 'antd';

export default function Page() {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const onFinish = async (values) => {
    console.log('Success:', values);
    if (values.password !== values.confirmPassword) {
      messageApi.error('两次密码不一致');
      return;
    }
    // 昵称不能超过10个字符，只能中文数字和英文，数字不能放在首位
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(values.nickname) || values.nickname.startsWith('0')) {
      messageApi.error('昵称只能包含中文、数字和英文，数字不能放在首位');
      return;
    }
    // 用户名只能英文和数字，数字不能放在首位，不超过10个字符
    if (!/^[a-zA-Z0-9]+$/.test(values.username) || values.username.startsWith('0') || values.username.length > 10) {
      messageApi.error('用户名只能包含英文和数字，数字不能放在首位，不超过10个字符');
      return;
    }
    // 密码长度不能超过15个字符且不少于6个字符，必须有特殊字符和大小写，且没有空格
    if (values.password.length < 6 || values.password.length > 15 || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(values.password) || !/[A-Z]/.test(values.password) || !/[a-z]/.test(values.password) || /\s/.test(values.password)) {
      messageApi.error('密码长度不能超过15个字符且不少于6个字符，必须有特殊字符和大小写，且没有空格');
      return;
    }
    // 生成一个uuid
    const uuid = uuidv4();
    // 调用注册接口
    try {
      const res = await axios.post('/portfolio/apis/user/register', { ...values, uuid });
      if (typeof window !== 'undefined') {
        // 将数据存入localStorage
        localStorage.setItem('calendar-user', JSON.stringify(res.data));
      }
    if (res.status === 200) {
      messageApi.success('注册成功');
      // 跳转至首页
      router.push('/dashboard/calendar');
    } else {
        messageApi.error(res?.data?.error || '注册失败');
      }
    } catch (error) {
      messageApi.error(error?.response?.data?.error || '注册失败');
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  return (
    <div className="flex justify-center items-center h-screen">
      {contextHolder}
      <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
          <Input placeholder="请输入昵称" />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请确认密码' }]} >
          <Input.Password placeholder="请确认密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            注册
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
