
const getAllBlockUrl = 'https://open.feishu.cn/open-apis/docx/v1/documents/PTqmd47MGo9aXyxblmBcS8kxnPf/blocks'
const tokenUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
const getRawDataurl = 'https://open.feishu.cn/open-apis/docx/v1/documents/PTqmd47MGo9aXyxblmBcS8kxnPf/raw_content'

export async function GET() {
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    body: JSON.stringify({
      app_id: 'cli_a78d238d85fc100e',
      app_secret: 'iHwpOjGosYiLkkYoSxXhRe1XHMSTPGPp',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }
  );
  const tokenData = await tokenResponse.json();
  const token = tokenData.tenant_access_token;
  const response = await fetch(getAllBlockUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
  }});
  const data = await response.json();
  const realData = JSON.parse(data?.data?.items[1]?.text?.elements[0]?.text_run?.content)
  return Response.json(realData);
}
