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

// 根据用户id获取sheetId，没有则创建
export async function GET(request: Request) {
  try {
    // 获取 URL 中的 userId 参数
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    let userSheetId = null;
    const sheetToken = 'Efn1s9qYphcyditDNRdccffCnKd'; // 主表格 token
    // 从用户信息文档获取userSheetId
    const userSheetInfo = await getFeiShuSheetInfoBySheetId(sheetToken, '7v6VVy');
    const userData = await getFeiShuSheetData(sheetToken, userSheetInfo.range);
    const userDataObject: any = transformArrayToObject(userData).find((item: any) => item.userId === userId);
    if (userDataObject) {
      userSheetId = userDataObject.sheetId;
    } else {
      // 如果userSheetId不存在，则创建
      userSheetId = await createFeiShuSheet(sheetToken, `用户${userId}的日历`);
      // 同时将用户信息插入用户信息表，如userId、sheetId
      await insertSheetData(sheetToken, userId, '7v6VVy', userSheetId, `用户${userId}的日历`);
    }
    return NextResponse.json({
      sheetId: userSheetId,
    });
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return NextResponse.json({ error: '获取用户数据失败' }, { status: 500 });
  }
}
