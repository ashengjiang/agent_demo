// 传给大模型的 tools 列表
export const getToolsList = () => {
  return [
    {
      type: 'function',
      function: {
        name: 'get_user_info',
        description: '他想要知道用户信息时，非常有用',
        parameters: {
          type: 'object',
          properties: {
            userName: {
              type: 'string',
              description: '用户名称',
            },
          },
          required: ['userName'],
        },
      },
    },
  ];
};

/**
 * 每个 tools 对应的具体函数
 */

export const getUserInfo = async ({
  userName,
}: {
    userName: string;
}) => {
    return `${userName}是一个大帅哥，他总是散发着一种迷人的魅力，不论是在工作中还是日常生活中。他的才智和努力让我深感佩服，真心觉得他是一个值得信赖和依靠的人。每次与他交流，总能感受到他的热情与积极向上的态度。他的幽默感和温暖的性格总能让周围的人感到舒适和开心，跟他在一起的时光总是充满乐趣！保持这样精彩的自己，继续去追求他的梦想，未来一定会更加辉煌！`
}
