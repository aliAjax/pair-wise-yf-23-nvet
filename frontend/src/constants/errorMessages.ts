export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  FIXTURE_NOT_FOUND: "未找到故障灯具，换灯未执行",
  REPLACEMENT_NOT_FOUND: "未选择替身灯具，换灯未执行",
  REPLACEMENT_TYPE_MISMATCH: "替身灯具类型必须为 {type}，整批换灯未写入",
  REPLACEMENT_NOT_RIGGED: "替身灯具 {code} 尚未就位（当前：{status}），整批换灯未写入",
  REPLACEMENT_DMX_CONFLICT: "替身灯具 DMX 地址与 {code} 冲突，整批换灯未写入",
  CUE_ARCHIVED_LOCKED: "Cue「{name}」已归档，整批换灯未写入",
  REPLACEMENT_PERSIST_FAILED: "换灯结果写入本地数据库失败，请重试"
};
