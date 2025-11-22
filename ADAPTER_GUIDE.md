# 站点适配器开发指南

本文档说明如何为 LLM Answer Navigator 添加新站点的支持。

## 架构概述

插件使用站点适配器模式来支持不同的 LLM 对话网站。每个站点适配器负责：
1. 识别站点是否支持
2. 找到页面上所有 AI 回答节点

## 添加新站点适配器

### 步骤 1：创建适配器文件

在 `src/content/siteAdapters/` 目录下创建新文件，例如 `claudeAdapter.ts`

### 步骤 2：实现 SiteAdapter 接口

```typescript
import type { SiteAdapter } from './index';

export const claudeAdapter: SiteAdapter = {
  name: 'Claude',
  
  isSupported(location: Location): boolean {
    // 实现站点识别逻辑
    return location.hostname === 'claude.ai' && 
           location.pathname.startsWith('/chat');
  },
  
  findAllAnswers(root: Document | HTMLElement): HTMLElement[] {
    // 实现查找 AI 回答节点的逻辑
    const answers: HTMLElement[] = [];
    
    // 示例：通过选择器查找
    const nodes = root.querySelectorAll('[data-role="assistant"]');
    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        answers.push(node);
      }
    });
    
    return answers;
  }
};
```

### 步骤 3：注册适配器

在 `src/content/siteAdapters/index.ts` 中：

1. 导入新适配器：
```typescript
import { claudeAdapter } from './claudeAdapter';
```

2. 添加到适配器列表：
```typescript
const adapters: SiteAdapter[] = [
  chatgptAdapter,
  claudeAdapter,  // 添加新适配器
];
```

### 步骤 4：更新 manifest.json

在 `src/manifest.json` 的 `content_scripts` 中添加新站点的匹配规则：

```json
{
  "content_scripts": [
    {
      "matches": [
        "https://chatgpt.com/*",
        "https://chat.openai.com/*",
        "https://claude.ai/*"  // 添加新站点
      ],
      "js": ["content/index.js"],
      "run_at": "document_idle"
    }
  ]
}
```

### 步骤 5：（可选）添加配置选项

如需在 Options 页面添加开关：

1. 更新 `src/options/index.html` 添加 UI
2. 更新 `src/options/index.ts` 添加配置逻辑
3. 更新 `src/content/index.ts` 读取配置

## 查找 AI 回答节点的技巧

### 方法 1：使用 data 属性
```typescript
root.querySelectorAll('[data-message-author-role="assistant"]')
```

### 方法 2：使用 class 名称
```typescript
root.querySelectorAll('.ai-message, .assistant-message')
```

### 方法 3：使用结构特征
```typescript
const messages = root.querySelectorAll('.message');
messages.forEach(msg => {
  if (!msg.querySelector('.user-avatar')) {
    // 可能是 AI 回答
    answers.push(msg);
  }
});
```

### 方法 4：组合多种方法
优先使用最可靠的选择器，提供备选方案：

```typescript
findAllAnswers(root: Document | HTMLElement): HTMLElement[] {
  // 方法 1: 最可靠的方式
  let answers = Array.from(root.querySelectorAll('[data-role="assistant"]'));
  
  // 方法 2: 备选方案
  if (answers.length === 0) {
    answers = Array.from(root.querySelectorAll('.ai-response'));
  }
  
  return answers as HTMLElement[];
}
```

## 测试建议

1. 在目标网站打开开发者工具
2. 检查控制台日志，确认适配器被正确识别
3. 验证找到的回答节点数量是否正确
4. 测试导航功能是否正常工作
5. 测试滚动和高亮是否准确

## 常见问题

### Q: 如何处理动态加载的内容？
A: 插件已经监听 DOM 变化，会自动刷新回答列表。

### Q: 如何处理嵌套的消息结构？
A: 在 `findAllAnswers` 中选择合适的节点层级，通常选择完整的消息容器而不是内部元素。

### Q: 如何调试选择器？
A: 在浏览器控制台使用 `$$('[your-selector]')` 测试选择器是否正确。

## 贡献

欢迎为更多 LLM 站点贡献适配器！提交 PR 前请确保：
- 代码通过 TypeScript 编译
- 在实际网站上测试过
- 添加了必要的注释
- 更新了相关文档

