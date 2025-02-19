import { Widget as LuminoWidget } from '@lumino/widgets';
import MarkdownIt from 'markdown-it';

interface IMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class MessageContainerWidget extends LuminoWidget {
  private _messages: IMessage[] = [];
  private _container: HTMLDivElement;
  private _md: MarkdownIt;

  constructor() {
    super();
    this.addClass('jp-message-container-widget');

    // 初始化 markdown 解析器
    this._md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str, lang) => {
        return `<pre class="jp-RenderedText jp-mod-${lang}"><code>${str}</code></pre>`;
      }
    });

    // 创建消息容器
    this._container = document.createElement('div');
    this._container.className = 'jp-message-container';
    Object.assign(this._container.style, {
      paddingBottom: '120px',
      overflowY: 'auto',
      flex: '1 1 auto'
    });

    this.node.appendChild(this._container);
  }

  addMessage(message: IMessage): void {
    this._messages.push(message);
    this._renderMessage(message);
    this._scrollToBottom();
  }

  clearMessages(): void {
    this._messages = [];
    this._container.innerHTML = '';
  }

  private _renderMessage(message: IMessage): void {
    const messageElement = document.createElement('div');
    messageElement.className = `jp-message jp-message-${message.role}`;

    const contentElement = document.createElement('div');
    contentElement.className = 'jp-message-content';

    if (message.role === 'assistant') {
      contentElement.innerHTML = this._md.render(message.content);
      this._processLinks(contentElement);
    } else {
      contentElement.textContent = message.content;
    }

    messageElement.appendChild(contentElement);
    this._container.appendChild(messageElement);
  }

  private _processLinks(element: HTMLElement): void {
    const links = element.getElementsByTagName('a');
    Array.from(links).forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  private _scrollToBottom(): void {
    this._container.scrollTop = this._container.scrollHeight;
  }
}
