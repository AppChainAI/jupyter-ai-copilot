import { Widget as LuminoWidget } from '@lumino/widgets';
import { IconWidget } from './IconWidget';

export class InputAreaWidget extends LuminoWidget {
  private _input: HTMLTextAreaElement;
  private _sendButton: HTMLButtonElement;
  private _onSend: (content: string) => void;

  constructor(onSend: (content: string) => void) {
    super();
    this._onSend = onSend;
    this.addClass('jp-input-area-widget');

    // 创建外层容器
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%'
    });

    // 文本输入框容器
    const inputContainer = document.createElement('div');
    this._input = document.createElement('textarea');
    this._input.className = 'jp-sidebar-input';
    this._input.placeholder = '输入消息...';
    this._input.rows = 3;
    Object.assign(this._input.style, {
      width: '100%',
      boxSizing: 'border-box'
    });
    inputContainer.appendChild(this._input);

    // 按钮容器（右对齐）
    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
      display: 'flex',
      justifyContent: 'flex-end'
    });

    this._sendButton = document.createElement('button');
    this._sendButton.className = 'jp-sidebar-send-button';

    // 使用图标组件
    const sendIcon = IconWidget.createSendIcon();
    this._sendButton.appendChild(sendIcon.node);

    Object.assign(this._sendButton.style, {
      transition: 'background-color 0.3s ease',
      cursor: 'pointer',
      padding: '6px',  // 调整内边距
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      backgroundColor: 'var(--jp-brand-color1)',
      border: 'none'
    });
    
    this._sendButton.onclick = () => this.handleSend();
    buttonContainer.appendChild(this._sendButton);

    // 添加悬停效果
    this._sendButton.onmouseenter = () => {
      this._sendButton.style.backgroundColor = 'var(--jp-brand-color2)';
    };
    this._sendButton.onmouseleave = () => {
      this._sendButton.style.backgroundColor = 'var(--jp-brand-color1)';
    };

    // 组装界面
    container.appendChild(inputContainer);
    container.appendChild(buttonContainer);
    this.node.appendChild(container);

    // 设置容器样式（保持固定定位）
    Object.assign(this.node.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'var(--jp-layout-color1)',
      padding: '16px',
      borderTop: '1px solid var(--jp-border-color1)',
      boxSizing: 'border-box'
    });
  }

  private handleSend(): void {
    const content = this._input.value.trim();
    if (!content) return;

    this._onSend(content);
    this._input.value = '';
    this._sendButton.disabled = true;
  }

  enableSendButton(): void {
    this._sendButton.disabled = false;
  }
}
