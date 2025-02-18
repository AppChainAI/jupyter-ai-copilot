# jupyter-ai-extends

## 进入虚拟环境

```bash
conda activate jupyter-ai-ext
```

## 安装扩展

```bash
touch yarn.lock
pip install -e .
jupyter labextension develop . --overwrite
```

## 构建扩展

```bash
jlpm run build
```

## 安装语言包

```bash
# 首先确保 jupyterlab 已更新到最新版本
pip install --upgrade jupyterlab

# 安装中文语言包
pip install jupyterlab-language-pack-zh-CN

# 或者使用 conda 安装
# conda install -c conda-forge jupyterlab-language-pack-zh-CN
```

要切换界面语言，请按以下步骤操作：
1. 在 JupyterLab 界面中点击 Settings → Language
2. 从下拉菜单中选择需要的语言（"English" 或 "简体中文"）
3. 刷新页面后即可看到相应语言的界面

注意：英语是 JupyterLab 的默认语言，无需额外安装语言包。

## 运行jupyter lab

```bash
# 设置默认使用中文运行
JUPYTERLAB_SETTINGS_DIR=./settings jupyter lab --notebook-dir=./notebooks
```

也可以通过配置文件设置默认语言：
1. 在项目根目录创建 `settings` 文件夹
2. 在 `settings` 文件夹中创建 `overrides.json` 文件，内容如下：
```json
{
    "@jupyterlab/translation-extension:plugin": {
        "locale": "zh_CN"
    }
}
```

注意：如果使用配置文件方式，运行时可以直接使用：
```bash
jupyter lab --notebook-dir=./notebooks --ServerApp.token='123456'
```

## 监控文件变化

```bash
jlpm watch
```

## 创建 Docker 网络

```bash
docker network create jupyter-network
```

## 构建 Docker 镜像

```bash
docker buildx build -t jupyter-ai-extensions:0.1 . --platform linux/amd64
```

## 运行 Docker 容器

```bash
docker-compose up -d
```