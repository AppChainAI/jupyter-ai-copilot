import { Widget as LuminoWidget } from '@lumino/widgets';
import { ILabShell } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { PageConfig } from '@jupyterlab/coreutils';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { InputAreaWidget } from './InputAreaWidget';
import { MessageContainerWidget } from './MessageContainerWidget';
import MarkdownIt from 'markdown-it';

export class SidebarWidget extends LuminoWidget {
  private _messageContainer: MessageContainerWidget;
  private _inputArea: InputAreaWidget;
  private _notebookTracker: INotebookTracker;
  private _md: MarkdownIt;

  constructor(labShell: ILabShell, notebookTracker: INotebookTracker) {
    super();
    this._notebookTracker = notebookTracker;
    this.addClass('jp-sidebar-widget');

    // 创建消息容器组件
    this._messageContainer = new MessageContainerWidget();

    // 创建输入区域组件
    this._inputArea = new InputAreaWidget((content: string) => this.handleSendRequest(content));

    // 组装界面
    this.node.appendChild(this._messageContainer.node);
    this.node.appendChild(this._inputArea.node);

    // 添加示例消息
    this._messageContainer.addMessage({
      role: 'assistant',
      content: '你好！我是你的 AI 助手，有什么我可以帮你的吗？'
    });

    // 容器样式设置
    this.node.style.height = '100vh';
    this.node.style.display = 'flex';
    this.node.style.flexDirection = 'column';

    // 添加调试代码查看所有配置
    console.log('AI_AGENT_URL:', PageConfig.getOption('AI_AGENT_URL'));

    // 初始化markdown-it
    this._md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    });
  }

  private async handleSendRequest(content: string): Promise<void> {
    if (!content) {
      return;
    }

    // 添加用户消息
    this._messageContainer.addMessage({
      role: 'user',
      content: content
    });

    // 清空输入框
    this._inputArea.enableSendButton();

    // 在流式请求开始前，先不创建消息元素
    let tempMessage: HTMLElement | null = null;
    let hasContent = false;

    // 在收到第一个数据包时创建消息元素
    function handleStreamData(chunk: string) {
      if (!tempMessage) {
        tempMessage = createMessageElement(); // 延迟到有数据时才创建
        hasContent = !!chunk.trim();
      }

      if (chunk) {
        appendToMessage(chunk);
      }
    }

    // 流式请求结束时检查
    function handleStreamEnd() {
      if (!hasContent && tempMessage) {
        // 移除空消息元素
        tempMessage.remove();
      }
      // 其他清理逻辑...
    }

    // 错误处理时也需要检查
    function handleStreamError() {
      if (tempMessage && !hasContent) {
        tempMessage.remove();
      }
    }

    const createMessageElement = () => {
      const element = document.createElement('div');
      element.className = 'jp-sidebar-message jp-sidebar-message-assistant';
      const content = document.createElement('div');
      content.className = 'jp-sidebar-message-content';
      element.appendChild(content);
      this._messageContainer.node.appendChild(element);
      return element;
    };

    const appendToMessage = (chunk: string) => {
      if (tempMessage) {
        const content = tempMessage.querySelector('.jp-sidebar-message-content');
        if (content) {
          content.textContent += chunk;
        }
      }
    };

    try {
      // 获取当前笔记本信息
      const currentNotebook = this._notebookTracker.currentWidget;
      const path = currentNotebook?.context.localPath || '';

      // 当前 jupyterlab 的 url
      // 如果 jupyterlab 是部署在本地，则使用 127.0.0.1:8888
      // 如果 jupyterlab 是部署在Docker，则使用 jupyter-ai-extensions:8888
      const jupyterlab_url = PageConfig.getOption('JUPYTERLAB_URL') || 'http://127.0.0.1:8888';
      // 准备请求数据
      const requestData = {
        server_url: jupyterlab_url,
        token: PageConfig.getToken(),
        path: path,
        input: content
      };

      // 获取 AI 代理 URL
      const url = PageConfig.getOption('AI_AGENT_URL') || 'http://127.0.0.1:8000/ai/agent/prompt';
      // 发送请求
      await fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        onopen: async response => {
          // 连接建立时的处理
          if (response.status !== 200) {
            throw new Error(`请求失败: ${response.status}`);
          }
        },
        onclose: () => {
          // 连接关闭时恢复按钮状态
          this._inputArea.enableSendButton();
          handleStreamEnd();
        },
        onmessage: ev => {
          try {
            const rawData = ev.data;

            // 直接解析原始数据
            const parsedData = JSON.parse(rawData);

            const { content: contentValue } = parsedData;

            // 检查 contentValue 是否是 JSON 字符串
            try {
              const jsonContent = JSON.parse(contentValue);
              if (jsonContent.cell_content) {
                // 处理代码单元格内容
                const cellContent = jsonContent.cell_content.replace(/\\n/g, '\n');
                handleStreamData(cellContent);
              } else {
                // JSON 对象但不是代码单元格
                handleStreamData(contentValue);
              }
            } catch (e) {
              // contentValue 不是 JSON 字符串，直接使用
              handleStreamData(contentValue);
            }

            // 重新渲染最后一条消息（修正缩进和格式）
            const lastMessageElement = this._messageContainer.node.lastElementChild;
            if (lastMessageElement) {
              const contentElement = lastMessageElement.querySelector(
                '.jp-sidebar-message-content'
              );
              if (contentElement) {
                contentElement.innerHTML = this._md.render(tempMessage?.textContent || '');
                // 为所有链接添加新窗口打开属性
                const links = contentElement.getElementsByTagName('a');
                Array.from(links).forEach(link => {
                  link.setAttribute('target', '_blank');
                  link.setAttribute('rel', 'noopener noreferrer');
                });
              }
            }
            // 滚动到底部（修正缩进）
            this._messageContainer.node.scrollTop = this._messageContainer.node.scrollHeight;
          } catch (error) {
            console.error('Error parsing message:', error);
            handleStreamError();
          }
        },
        onerror: err => {
          console.error('EventSource error:', err);
          handleStreamError();
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      handleStreamError();
    } finally {
      // 保留 finally 作为最后的安全保障
      this._inputArea.enableSendButton();
    }
  }
}
