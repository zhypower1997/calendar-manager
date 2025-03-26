import { NextResponse } from 'next/server'
import { getFeiShuToken, getFeiShuSheetInfoBySheetId } from '@/app/utils/feishu'

interface ValueRange {
  range: string
  values: (string | number)[][]
}
interface RequestBody {
  valueRange: ValueRange
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetToken = searchParams.get('sheetToken');
    const sheetId = searchParams.get('sheetId');
    const body: RequestBody = await request.json()
    const token = await getFeiShuToken()
    const { row, sheetId: sheetId2 } = await getFeiShuSheetInfoBySheetId(sheetToken, sheetId)
    const response = await fetch(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/values`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueRange: { ...body.valueRange, range: `${sheetId2}!A2:T2000` }
        }),
      }
    )
    const data = await response.json()
    // 删除行列接口
    const deleteUrl = `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/dimension_range`
    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "dimension": {
          "sheetId": data?.data?.updatedRange?.split('!')[0],
          "majorDimension": "ROWS",
          "startIndex": data?.data?.updatedRows + 2,
          "endIndex": row
        }
      })
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating spreadsheet:', error)
    return NextResponse.json(
      { error: '更新电子表格时发生错误' },
      { status: 500 }
    )
  }
}
