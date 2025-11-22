// Options page script
console.log('Options page loaded');

// 配置键
const CONFIG_KEYS = {
  ENABLE_CHATGPT: 'enable_chatgpt'
};

// 加载配置
async function loadSettings(): Promise<void> {
  try {
    const result = await chrome.storage.sync.get(CONFIG_KEYS.ENABLE_CHATGPT);
    const enableChatGPT = result[CONFIG_KEYS.ENABLE_CHATGPT] !== false; // 默认启用
    
    const checkbox = document.getElementById('enable-chatgpt') as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = enableChatGPT;
    }
    
    console.log('设置已加载:', { enableChatGPT });
  } catch (error) {
    console.error('加载设置失败:', error);
  }
}

// 保存配置
async function saveSetting(key: string, value: any): Promise<void> {
  try {
    await chrome.storage.sync.set({ [key]: value });
    showSaveStatus();
    console.log('设置已保存:', { [key]: value });
  } catch (error) {
    console.error('保存设置失败:', error);
  }
}

// 显示保存状态提示
function showSaveStatus(): void {
  const status = document.getElementById('save-status');
  if (status) {
    status.classList.add('success');
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 2000);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 加载设置
  loadSettings();
  
  // 监听 ChatGPT 开关变化
  const chatgptCheckbox = document.getElementById('enable-chatgpt') as HTMLInputElement;
  if (chatgptCheckbox) {
    chatgptCheckbox.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      saveSetting(CONFIG_KEYS.ENABLE_CHATGPT, target.checked);
    });
  }
});

