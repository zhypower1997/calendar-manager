export async function getFeiShuToken() {
  const tokenUrl = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";
  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    body: JSON.stringify({
      app_id: "cli_a78d238d85fc100e",
      app_secret: "iHwpOjGosYiLkkYoSxXhRe1XHMSTPGPp",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const tokenData = await tokenResponse.json();
  return tokenData.tenant_access_token;
}

// 先获取表格的行和列
export async function getFeiShuTableInfo(sheetToken: string) {
  const getTableInfo =
  `https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${sheetToken}/sheets/query`;
  const token = await getFeiShuToken();
  const tableInfo = await fetch(getTableInfo, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const tableInfoData = await tableInfo.json();
  const column = tableInfoData.data.sheets[0].grid_properties?.column_count;
  const row = tableInfoData.data.sheets[0].grid_properties?.row_count;
  const sheetId = tableInfoData.data.sheets[0].sheet_id;
  const range = `${
    tableInfoData.data.sheets[0].sheet_id
  }!A1:${String.fromCharCode(65 + column - 1)}${row}`;
  return { row, column, range, sheetId };
}

