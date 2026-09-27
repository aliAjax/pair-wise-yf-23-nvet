export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  // 应急换灯校验消息，{name} / {code} 由 service 层填充具体对象
  SWAP_FAULTY_REQUIRED: "请先选择故障灯",
  SWAP_STANDIN_REQUIRED: "请先选择替身灯",
  SWAP_STANDIN_NOT_READY: "替身灯 {name} 尚未就位，不能写入换灯方案",
  SWAP_TYPE_MISMATCH: "替身灯 {name} 类型与故障灯不一致，不能替换",
  SWAP_DMX_CONFLICT: "替身灯 {name} 的 DMX 地址与 {code} 冲突",
  SWAP_CUE_ARCHIVED: "Cue「{name}」已归档，整批换灯不写入",
  SWAP_STANDIN_ALREADY_IN_CUE: "Cue「{name}」已引用替身灯，无法整批换灯"
};
