import axios from "axios";

// 获取飞书 token
export async function getFeiShuToken() {
  const tokenUrl = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";
  const tokenResponse = await axios.post(tokenUrl, {
    app_id: "cli_a78d238d85fc100e",
    app_secret: "iHwpOjGosYiLkkYoSxXhRe1XHMSTPGPp",
  }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const tokenData = tokenResponse.data;
  return tokenData.tenant_access_token;
}

// 新建工作表
export async function createFeiShuSheet(sheetToken: string, sheetName: string) {
  const token = await getFeiShuToken();
  const createSheet = `
https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/sheets_batch_update`;
  try {
    const createSheetResponse = await axios.post(createSheet, {
      requests: [
        {
          // addSheet: {
          //   properties: {
          //     title: sheetName,
          //   },
          // },
          copySheet: {
            destination: {
              title: sheetName,
            },
            source: {
              sheetId: '6jg1MS'
          }
        },
      }
      ],
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const createSheetData = createSheetResponse?.data?.data;
    return createSheetData?.replies?.[0]?.copySheet?.properties?.sheetId || '';
  } catch (error) {
    console.error('创建工作表失败:', error);
    throw error;
  }
}

interface SheetInfo {
    row: number;
    column: number;
    range: string;
    sheetId: string;
}

// 先获取表格的行和列
export async function getFeiShuSheetInfo(sheetToken: string, targetSheetId?: string): Promise<SheetInfo> {
    const getTableInfo = `https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${sheetToken}/sheets/query`;
    const token = await getFeiShuToken();

    const tableInfo = await axios.get(getTableInfo, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const sheets = tableInfo.data.data.sheets;

    // 确定要使用的 sheet
    let targetSheet;
    if (targetSheetId) {
        // 如果指定了 sheetId，查找对应的 sheet
        targetSheet = sheets.find(sheet => sheet.sheet_id === targetSheetId);
        if (!targetSheet) {
            throw new Error(`未找到指定的 sheet: ${targetSheetId}`);
        }
    } else {
        // 如果没有指定 sheetId，使用第一个 sheet
        targetSheet = sheets[0];
    }

    const column = targetSheet.grid_properties.column_count;
    const row = targetSheet.grid_properties.row_count;
    const sheetId = targetSheet.sheet_id;

    // 构建范围字符串，例如: "456a38!A1:T19"
    const range = `${sheetId}!A1:${String.fromCharCode(64 + column)}${row}`;

    return {
        row,
        column,
        range,
        sheetId
    };
}

// 以sheetId为参数，获取表格信息
export async function getFeiShuSheetInfoBySheetId(sheetToken: string, sheetId: string) {
  const getTableInfo = `
https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${sheetToken}/sheets/${sheetId}`;

  const token = await getFeiShuToken();
  const tableInfo = await axios.get(getTableInfo, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const row = tableInfo.data.data.sheet.grid_properties.row_count;
  const column = tableInfo.data.data.sheet.grid_properties.column_count;
  const range = `${sheetId}!A1:${String.fromCharCode(64 + column)}${row}`;
  return {
    row,
    column,
    range,
    sheetId
  };
}

// 按range获取表格数据
export async function getFeiShuSheetData(sheetToken: string, range: string) {
  const getTableData = `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/values/${range}`;
  const token = await getFeiShuToken();
  const tableData = await axios.get(getTableData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return tableData.data?.data?.valueRange?.values;
}


// 插入用户信息表
export async function insertSheetData({sheetToken, userId, insertSheetId, sheetId, sheetName, nickname, password, userName}: {sheetToken: string, userId: string, insertSheetId: string, sheetId: string, sheetName: string, nickname?: string, password?: string, userName?: string}) {
  const insertUrl = `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/values_prepend`;
  const token = await getFeiShuToken();
  await axios.post(insertUrl,{
    valueRange: {
      range: `${insertSheetId}!A2:E2`,
      values: [[userName, userId, nickname, password, sheetId]],
    },
  }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
