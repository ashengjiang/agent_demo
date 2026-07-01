import { useRef } from 'react';
import {
  getToolsList,
  getUserInfo
} from './server';

interface ITool {
  type: string;
  function: any;
}

// MCP tool名称枚举
export enum ToolNameE {
  userinfo = 'get_user_info',
}

// tool名称与tool call映射
const functionMapper: any = {
  [ToolNameE.userinfo]: getUserInfo,
};

export const modelName = 'qwen-plus';
const API_URL =
  'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = 'sk-d9952b75266f4a448941f529b8b47fa7'; // API 密钥

export const useCreateAgent = ({
  inputValue,
  responseRef,
}: {
  inputValue: string;
  responseRef: React.MutableRefObject<string>;
}) => {
  const abortControllerRef = useRef<any>(null); // 引用用于控制请求的 AbortController
  const toolListRef = useRef<ITool[]>([]);

  // 链接 MCP Server，返回 tools 列表
  const connectToServer = async () => {
    const resTool = await getToolsList();
    toolListRef.current = resTool;
  };

  // 处理 llg message 参数
  const processQuery = async (query: string) => {
    const messages = [
      {
        role: 'system',
        content: `你是一个夸人高手，如果用户让你评价一个人时，请使用‘get_user_info’，请你结合相关tools生成符合用户需求的回答`,
      },
      {
        role: 'user',
        content: query,
      },
    ];

    await loopCall(messages);
    return responseRef.current;
  };

  const loopCall = async (messages: any) => {
    const response = await callOpenAI(messages);

    for (const content of response.choices) {
      if (content.finish_reason === 'stop') {
        responseRef.current = content.message.content;
        break;
      } else if (content.message.tool_calls?.length) {
        const toolCall = content.message.tool_calls[0];
        const toolName = toolCall.function.name;
        const toolArgs: string = toolCall.function.arguments;
        const toolContent = await functionMapper[toolName](
          JSON.parse(toolArgs),
        );
        try {
          messages.push(content.message);
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            arguments: JSON.parse(toolArgs),
            content: toolContent,
          });
          await loopCall(messages);
        } catch (e) {
          console.log('Error calling tool: ', e);
          break;
        }
      }
    }
  };

  const callOpenAI = async (messages: string) => {
    try {
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current; // 获取信号
      const response = await fetch(API_URL, {
        signal,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName, // 模型名
          messages,
          tools: toolListRef.current,
        }),
      });
      // 使用 response.body，确保它是可读取的
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const { value } = await reader!.read();
      const chunk = decoder.decode(value, { stream: true });
      return JSON.parse(`${chunk}`);
    } catch (error) {
      console.error('Error fetching data from API:', error);
      throw error; // 重新抛出错误以便处理
    }
  };

  const chatLoop = async () => {
    const response = await processQuery(inputValue);
    return response;
  };

  return {
    chatLoop,
    connectToServer,
    abortControllerRef,
  };
};
