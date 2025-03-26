import { getFeiShuSheetInfo, getFeiShuSheetData, getFeiShuSheetInfoBySheetId } from '@/app/utils/feishu'

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

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const sheetToken = searchParams.get('sheetToken');

//   const tableInfoData = await getFeiShuSheetInfo(sheetToken);
//   const { range } = tableInfoData;

//   const tableData = await getFeiShuTableData(sheetToken, range);
//   return Response.json(convertTableDataToObject(tableData));
// }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sheetToken = searchParams.get('sheetToken');
  const sheetId = searchParams.get('sheetId');

  const sheetInfoData = await getFeiShuSheetInfoBySheetId(sheetToken, sheetId);
  const { range } = sheetInfoData;

  const tableData = await getFeiShuSheetData(sheetToken, range);
  return Response.json(convertTableDataToObject(tableData));
}
