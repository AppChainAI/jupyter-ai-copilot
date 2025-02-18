import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

// 添加必要的导入
// import { Widget } from '@lumino/widgets';
import { SidebarWidget } from './components/SidebarWidget';
import '../style/index.css';

/**
 * Initialization data for the agent_chat extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'agent_chat:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension agent_chat is activated!');
  }
};

// 创建侧边栏组件
// 删除原有的 SidebarWidget 类定义

// 添加新的侧边栏插件
const sidebarPlugin: JupyterFrontEndPlugin<void> = {
  id: 'agent_chat:sidebar',
  autoStart: true,
  requires: [ILabShell, INotebookTracker],
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    notebookTracker: INotebookTracker
  ) => {
    const sidebarWidget = new SidebarWidget(labShell, notebookTracker);
    sidebarWidget.id = 'agent_chat-sidebar';
    sidebarWidget.title.caption = 'agent_chat';
    sidebarWidget.title.iconClass = 'jp-SideBar-tabIcon';

    labShell.add(sidebarWidget, 'right', { rank: 2000 });

    // 修改为只在初始化时展开一次
    const initialExpand = () => {
      labShell.activateById(sidebarWidget.id);
      labShell.expandRight();
    };

    // 只在应用程序初始化完成后展开一次
    app.restored.then(() => {
      initialExpand();
    });

    // 删除其他监听器，不再强制保持展开
  }
};

// 修改导出为插件数组
const plugins: JupyterFrontEndPlugin<void>[] = [plugin, sidebarPlugin];
export default plugins;
