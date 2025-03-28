import { NextResponse } from 'next/server';
import { getFeiShuSheetInfoBySheetId, getFeiShuSheetData } from '@/app/utils/feishu';

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

// 登录
export async function POST(request: Request) {
  const sheetToken = 'Efn1s9qYphcyditDNRdccffCnKd'; // 主表格 token
  const { username, password } = await request.json();
  // 校验用户名和密码
  const userSheetInfo = await getFeiShuSheetInfoBySheetId(sheetToken, '7v6VVy');
  const userData = await getFeiShuSheetData(sheetToken, userSheetInfo.range);
  const userDataObject: any = transformArrayToObject(userData).find((item: any) => item.userName === username);
  // 没有用户，返回错误
  if (!userDataObject) {
    return NextResponse.json({ error: '用户不存在' }, { status: 400 });
  }
  // 有用户，校验密码
  if (userDataObject.password !== password) {
    return NextResponse.json({ error: '密码错误' }, { status: 400 });
  }
  // 密码正确，返回用户信息
  return NextResponse.json({ userId: userDataObject.userId, sheetId: userDataObject.sheetId, nickname: userDataObject.nickname, username: userDataObject.userName }, { status: 200 });
}
