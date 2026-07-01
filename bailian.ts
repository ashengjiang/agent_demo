import axios from 'axios';

const config = {
  DASHSCOPE_API_KEY: 'sk-b620be332d084faf833d6d2a76e6ed21',
};

interface DashScopeConfig {
  appId: string;
  prompt: string;
  pluginCode?: string;
  biz_params?: any;
}

export async function callDashScope({
  appId,
  prompt,
  biz_params,
}: DashScopeConfig) {
  const apiKey = config.DASHSCOPE_API_KEY;
  const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

  const data = {
    input: {
      prompt,
      biz_params,
    },
    parameters: {},
    debug: {},
  };

  try {
    console.log('Sending request to DashScope API...');

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      if (response.data.output && response.data.output.text) {
        console.log(`response: ${response.data.output.text}`);
        return response.data.output.text;
      }
    } else {
      console.log('Request failed:');
      if (response.data.request_id) {
        console.log(`request_id=${response.data.request_id}`);
      }
      console.log(`code=${response.status}`);
      if (response.data.message) {
        console.log(`message=${response.data.message}`);
      } else {
        console.log('message=Unknown error');
      }
      return Promise.reject(response.data.message);
    }
  } catch (error) {
    return Promise.reject(`Error calling DashScope: ${error}`);
  }
}
