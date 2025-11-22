import type { SiteAdapter } from './index';

/**
 * ChatGPT 站点适配器
 */
export const chatgptAdapter: SiteAdapter = {
  name: 'ChatGPT',
  
  /**
   * 判断是否是 ChatGPT 对话页面
   */
  isSupported(location: Location): boolean {
    const { hostname, pathname } = location;
    
    // 检测是否是 ChatGPT 域名
    const isChatGPT = hostname === 'chatgpt.com' || hostname === 'chat.openai.com';
    
    // 检测是否是对话页面（路径包含 /c/ 或者是根路径）
    const isConversationPage = pathname === '/' || pathname.startsWith('/c/');
    
    return isChatGPT && isConversationPage;
  },
  
  /**
   * 在 ChatGPT 页面中查找所有 AI 回答节点
   * 
   * ChatGPT 的 DOM 结构说明：
   * - AI 回答通常在一个包含特定 data-* 属性的 div 中
   * - 可以通过 data-message-author-role="assistant" 来识别
   * - 需要排除输入框、顶部导航等非对话内容
   */
  findAllAnswers(root: Document | HTMLElement): HTMLElement[] {
    const answers: HTMLElement[] = [];
    const foundMethods: string[] = [];
    
    /**
     * 过滤掉非对话内容
     */
    const isValidAnswer = (element: HTMLElement): boolean => {
      // 排除输入框区域（通常包含 textarea 或 contenteditable）
      if (element.querySelector('textarea') || 
          element.querySelector('[contenteditable="true"]') ||
          element.querySelector('form')) {
        return false;
      }
      
      // 排除顶部模型选择器等导航元素
      // 通常在页面顶部，且位置固定
      const rect = element.getBoundingClientRect();
      if (rect.top < 100 && rect.height < 100) {
        return false;
      }
      
      // 排除太小的元素（可能是按钮、图标等）
      const textContent = element.textContent?.trim() || '';
      if (textContent.length < 10) {
        return false;
      }
      
      // 排除只包含简短文本的元素（如 "ChatGPT 4o"）
      if (textContent.length < 30 && !element.querySelector('pre, code, ol, ul')) {
        return false;
      }
      
      return true;
    };
    
    // 方法 1: 尝试通过 data-message-author-role 属性查找（最可靠）
    const messageElements = root.querySelectorAll('[data-message-author-role="assistant"]');
    if (messageElements.length > 0) {
      foundMethods.push(`data-message-author-role (${messageElements.length})`);
      messageElements.forEach(el => {
        if (el instanceof HTMLElement && isValidAnswer(el)) {
          answers.push(el);
        }
      });
    }
    
    // 方法 2: 查找包含 assistant 回答的对话组容器
    if (answers.length === 0) {
      const conversationTurns = root.querySelectorAll('[data-testid^="conversation-turn"]');
      conversationTurns.forEach(turn => {
        if (turn instanceof HTMLElement) {
          // 必须包含 assistant 标记
          const hasAssistant = turn.querySelector('[data-message-author-role="assistant"]');
          
          if (hasAssistant && isValidAnswer(turn)) {
            answers.push(turn);
          }
        }
      });
      if (answers.length > 0) {
        foundMethods.push(`conversation-turn (${answers.length})`);
      }
    }
    
    // 方法 3: 查找 main 标签内的对话内容（限定在对话区域）
    if (answers.length === 0) {
      const mainElement = root.querySelector('main');
      if (mainElement) {
        // 查找对话容器中的 article 元素（ChatGPT 使用 article 包裹对话）
        const articles = mainElement.querySelectorAll('article');
        articles.forEach((article, index) => {
          if (article instanceof HTMLElement && isValidAnswer(article)) {
            // 检查是否是 AI 回答（通常偶数索引，或包含特定标记）
            const hasAssistantMarker = article.querySelector('[data-message-author-role="assistant"]');
            const isOddIndex = index % 2 === 1;
            
            if (hasAssistantMarker || isOddIndex) {
              answers.push(article);
            }
          }
        });
      }
      if (answers.length > 0) {
        foundMethods.push(`article-based (${answers.length})`);
      }
    }
    
    // 去重（有些方法可能找到重复的元素）
    const uniqueAnswers = Array.from(new Set(answers));
    
    // 调试信息
    if (uniqueAnswers.length > 0) {
      console.log(`✅ ChatGPT Adapter: 找到 ${uniqueAnswers.length} 个 AI 回答节点 [方法: ${foundMethods.join(', ')}]`);
      if (uniqueAnswers.length > 0) {
        console.log('第一个回答节点:', {
          tag: uniqueAnswers[0].tagName,
          classes: uniqueAnswers[0].className,
          textPreview: uniqueAnswers[0].textContent?.substring(0, 50) + '...',
          hasTextarea: !!uniqueAnswers[0].querySelector('textarea'),
          hasForm: !!uniqueAnswers[0].querySelector('form')
        });
      }
    } else {
      console.warn('⚠️ ChatGPT Adapter: 未找到任何 AI 回答节点，请检查页面结构');
    }
    
    return uniqueAnswers;
  }
};

