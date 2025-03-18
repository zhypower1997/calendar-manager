import { NextResponse } from 'next/server'
import { getFeiShuToken, getFeiShuTableInfo } from '@/app/utils/feishu'

interface ValueRange {
  range: string
  values: (string | number)[][]
}
interface RequestBody {
  valueRange: ValueRange
}

export async function PUT(request: Request) {
  try {
    const sheetToken = request.url.split('?')[1].split('=')[1]
    const body: RequestBody = await request.json()
    const token = await getFeiShuToken()
    const { row, sheetId } = await getFeiShuTableInfo(sheetToken)
    const response = await fetch(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/values`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueRange: { ...body.valueRange, range: `${sheetId}!A2:T2000` }
        }),
      }
    )
    const data = await response.json()
    // 删除行列接口
    const deleteUrl = `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/dimension_range`
    const deleteResponse = await fetch(deleteUrl, {
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
    const deleteData = await deleteResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating spreadsheet:', error)
    return NextResponse.json(
      { error: '更新电子表格时发生错误' },
      { status: 500 }
    )
  }
}
