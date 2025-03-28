import { NextResponse } from 'next/server';
import { createFeiShuSheet, getFeiShuSheetInfoBySheetId, getFeiShuSheetData, insertSheetData } from '@/app/utils/feishu';

const transformArrayToObject = (arr: any[]) => {
  if (!arr.length ||!arr[0].length) {
      return [];
  }
  const headers = arr[0];
  return arr.slice(1).map(row => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
          if (row[i]!== null) {
              obj[headers[i]] = row[i];
          }
      }
      return obj;
  }).filter(obj => Object.keys(obj).length > 0);
}

// 注册
export async function POST(request: Request) {
  // 获取请求体
  const { username, password, nickname, uuid } = await request.json();
  // 使用createFeiShuSheet创建一个sheet，sheet名称为用户名
  const sheetToken = 'Efn1s9qYphcyditDNRdccffCnKd'; // 主表格 token
  // 判断是否存在用户
  const userSheetInfo = await getFeiShuSheetInfoBySheetId(sheetToken, '7v6VVy');
  const userData = await getFeiShuSheetData(sheetToken, userSheetInfo.range);
  const userDataObject: any = transformArrayToObject(userData).find((item: any) => item.userName === username);
  if (userDataObject) {
    return NextResponse.json({ error: '用户已存在' }, { status: 400 });
  }
  const sheetId = await createFeiShuSheet(sheetToken, `用户${nickname}的日历`);
  // 将用户信息插入用户信息表，如userId、sheetId
  await insertSheetData({sheetToken, userId: uuid, insertSheetId: '7v6VVy', sheetId, sheetName: `用户${nickname}的日历`, nickname, password, userName: username});

  // 返回用户信息
  return NextResponse.json({ userId: uuid, sheetId, nickname, username }, { status: 200 });
}
