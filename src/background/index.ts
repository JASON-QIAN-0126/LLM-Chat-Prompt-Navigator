// Background Service Worker
console.log('LLM Answer Navigator: Background service worker started');

// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  
  // 获取当前活动的 tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      // 向 content script 发送消息
      const message = command === 'prev-answer' 
        ? { type: 'LLM_NAV_PREV_ANSWER' }
        : { type: 'LLM_NAV_NEXT_ANSWER' };
      
      chrome.tabs.sendMessage(tabs[0].id, message).catch((error) => {
        console.error('Failed to send message to content script:', error);
      });
    }
  });
});

