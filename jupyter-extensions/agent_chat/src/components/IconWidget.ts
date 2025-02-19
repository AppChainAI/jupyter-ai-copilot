import { Widget as LuminoWidget } from '@lumino/widgets';

export class IconWidget extends LuminoWidget {
  constructor(svgContent: string) {
    super();
    this.node.innerHTML = svgContent;
  }

  static createSendIcon(size: number = 18): IconWidget {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
           stroke="currentColor" style="width:${size}px;height:${size}px">
        <path stroke-linecap="round" stroke-linejoin="round" 
              d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"/>
      </svg>
    `;
    const iconWidget = new IconWidget(svg);
    iconWidget.node.setAttribute('width', `${size}px`);
    iconWidget.node.setAttribute('height', `${size}px`);
    return iconWidget;
  }
}
