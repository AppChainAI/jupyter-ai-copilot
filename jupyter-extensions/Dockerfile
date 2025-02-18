# 使用官方 Python 镜像作为基础镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    git \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 yarn
RUN npm install -g yarn

# 首先只复制依赖相关的文件
COPY agent_chat/package.json agent_chat/yarn.lock ./agent_chat/
COPY agent_chat/pyproject.toml agent_chat/setup.py ./agent_chat/

# 安装 Python 依赖
RUN pip install --no-cache-dir \
    jupyterlab>=4.0.0 \
    jupyter-collaboration \
    ipykernel \
    jupyterlab-language-pack-zh-CN \
    nodejs

# 安装扩展依赖
WORKDIR /app/agent_chat

# 现在复制其余的项目文件
COPY ./agent_chat/ .

# 构建扩展
RUN pip install -e . 
RUN jlpm install
RUN jlpm run build:prod
RUN jupyter labextension build .

# 创建配置目录和文件
RUN mkdir -p /app/settings && \
    echo '{"@jupyterlab/translation-extension:plugin": {"locale": "zh_CN"}}' > /app/settings/overrides.json

# 创建notebooks目录
RUN mkdir -p /app/notebooks

# 设置环境变量
ENV JUPYTERLAB_SETTINGS_DIR=/app/settings

# 添加环境变量到构建阶段（如果需要）
ARG AI_AGENT_URL
ENV AI_AGENT_URL=${AI_AGENT_URL:-http://127.0.0.1:8000/ai/agent/stream-prompt}

# 暴露端口
EXPOSE 8888

# 设置工作目录
WORKDIR /app

# 启动命令最终版
CMD ["sh", "-c", "jupyter lab --ServerApp.tornado_settings='{\"page_config_data\":{\"AI_AGENT_URL\":\"'$AI_AGENT_URL'\"}}' --ip=0.0.0.0 --port=8888 --allow-root --no-browser --notebook-dir=/app/notebooks"]
