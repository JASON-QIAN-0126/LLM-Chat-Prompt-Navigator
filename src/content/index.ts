// Content Script
console.log('LLM Answer Navigator: Content script loaded');

// 临时占位，后续将添加核心逻辑
function init() {
  console.log('LLM Answer Navigator: Initializing...');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  
  if (message.type === 'LLM_NAV_PREV_ANSWER') {
    console.log('Navigate to previous answer');
    // 后续实现
  } else if (message.type === 'LLM_NAV_NEXT_ANSWER') {
    console.log('Navigate to next answer');
    // 后续实现
  }
});

