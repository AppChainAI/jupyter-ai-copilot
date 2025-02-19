import { Widget as LuminoWidget } from '@lumino/widgets';

export class InputAreaWidget extends LuminoWidget {
  private _input: HTMLTextAreaElement;
  private _sendButton: HTMLButtonElement;
  private _onSend: (content: string) => void;

  constructor(onSend: (content: string) => void) {
    super();
    this._onSend = onSend;
    this.addClass('jp-input-area-widget');

    // 创建文本输入框
    this._input = document.createElement('textarea');
    this._input.className = 'jp-sidebar-input';
    this._input.placeholder = '输入消息...';
    this._input.rows = 3;

    // 创建发送按钮
    this._sendButton = document.createElement('button');
    this._sendButton.className = 'jp-sidebar-send-button';
    this._sendButton.innerHTML = '发送';
    Object.assign(this._sendButton.style, {
      transition: 'background-color 0.3s ease',
      cursor: 'pointer'
    });
    this._sendButton.onclick = () => this.handleSend();

    // 组装界面
    this.node.appendChild(this._input);
    this.node.appendChild(this._sendButton);

    // 设置容器样式
    Object.assign(this.node.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'var(--jp-layout-color1)',
      padding: '16px',
      borderTop: '1px solid var(--jp-border-color1)'
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