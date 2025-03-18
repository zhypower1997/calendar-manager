import { getFeiShuToken, getFeiShuTableInfo } from '@/app/utils/feishu'

const convertTableDataToObject = (data: any[]) => {
  if (!data || data.length <= 1) return [];

  // 表头应该是：id, title, start, end, allDay, backgroundColor, done
  const headers = ['title', 'start', 'end', 'id', 'backgroundColor', 'done'];

  return data.slice(1).map(row => {
    const event: any = {};
    headers.forEach((header, index) => {
      if (header === 'allDay') {
        event[header] = row[index] === 'true';
      } else if (header === 'done') {
        event.extendedProps = { done: String(row[index]) === 'true' };
      } else {
        event[header] = row[index];
      }
    });
    return event;
  }).filter(event => event.id && event.title); // 过滤掉无效数据
};

export async function GET(request: Request) {
  const token = await getFeiShuToken();
  const sheetToken = request.url.split('?')[1].split('=')[1]
  const tableInfoData = await getFeiShuTableInfo(sheetToken);
  const { range } = tableInfoData;
  const getAllBlockUrl =
  `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/values/:range`;
  const getTableSheet = getAllBlockUrl.replace(":range", range);

  const response = await fetch(getTableSheet, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  const realData = convertTableDataToObject(data?.data?.valueRange?.values);
  return Response.json(realData);
}
