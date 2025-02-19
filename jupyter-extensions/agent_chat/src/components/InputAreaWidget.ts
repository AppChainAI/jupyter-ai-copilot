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

    // 提前创建输入框元素
    this._input = document.createElement('textarea');
    this._input.className = 'jp-sidebar-input';
    this._input.placeholder = '输入消息...';
    this._input.rows = 1;

    // 创建外层容器
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '0px',
      width: '100%',
      borderRadius: '8px',
      padding: '8px',
      boxShadow: '0px 4px 16px rgba(128, 128, 128, 0.3)'
    });

    // 文本输入框容器
    const inputContainer = document.createElement('div');
    Object.assign(this._input.style, {
      width: '100%',
      boxSizing: 'border-box',
      border: 'none',
      fontSize: '16px',
      outline: 'none'
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

    // 使用图标组件（添加尺寸参数）
    const sendIcon = IconWidget.createSendIcon(18); // 从原来的24px调整为18px
    this._sendButton.appendChild(sendIcon.node);

    Object.assign(this._sendButton.style, {
      transition: 'background-color 0.3s ease',
      cursor: 'pointer',
      padding: '4px', // 从6px减小到4px，使按钮更紧凑
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

    // 添加焦点事件监听器
    this._input.addEventListener('focus', () => {
      this._input.style.border = 'none';
      this._input.style.boxShadow = 'none';
    });

    // 组装界面
    container.appendChild(inputContainer);
    container.appendChild(buttonContainer);
    this.node.appendChild(container);

    // 设置容器样式（保持固定定位）
    Object.assign(this.node.style, {
      position: 'fixed',
      bottom: '0',
      left: '0px',
      right: 'calc(16px + var(--jp-scrollbar-width, 0px))',
      background: 'var(--jp-layout-color1)',
      padding: '16px 16px',
      boxSizing: 'border-box',
      zIndex: '1000',
      borderRadius: '4px 4px 0 0'
    });

    // 延迟执行确保DOM挂载
    if (!document.getElementById('input-area-styles')) {
      const style = document.createElement('style');
      style.id = 'input-area-styles';
      style.textContent = `
        .jp-input-area-widget .jp-sidebar-input::placeholder {
          color: var(--jp-ui-font-color2) !important; /* 使用Jupyter主题变量 */
          opacity: 0.9 !important;
          font-style: italic;
        }
        
        /* 添加浏览器前缀兼容 */
        .jp-input-area-widget .jp-sidebar-input::-webkit-input-placeholder {
          color: var(--jp-ui-font-color2) !important;
        }
        .jp-input-area-widget .jp-sidebar-input::-moz-placeholder {
          color: var(--jp-ui-font-color2) !important;
        }
        .jp-input-area-widget .jp-sidebar-input:-ms-input-placeholder {
          color: var(--jp-ui-font-color2) !important;
        }
      `;
      document.head.appendChild(style);
    }

    // 使用requestAnimationFrame等待样式应用
    requestAnimationFrame(() => {
      const computedColor = getComputedStyle(
        this._input,
        '::placeholder'
      ).color;

      if (computedColor !== 'rgb(96, 96, 96)') {
        this._input.style.setProperty(
          '--placeholder-color',
          'rgb(96, 96, 96)',
          'important'
        );
      }
    });

    // 在输入框初始化后添加
    this._input.setAttribute(
      'data-placeholder-color',
      'var(--jp-ui-font-color2)'
    );
  }

  private handleSend(): void {
    const content = this._input.value.trim();
    if (!content) {
      return;
    }

    this._onSend(content);
    this._input.value = '';
    this._sendButton.disabled = true;
  }

  enableSendButton(): void {
    this._sendButton.disabled = false;
  }
}
