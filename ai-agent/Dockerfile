# 构建阶段
FROM python:3.11-slim AS builder

# 安装构建依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 创建虚拟环境
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 升级 pip 并安装构建工具
RUN pip install --no-cache-dir -U pip setuptools wheel

# 复制项目文件
WORKDIR /app
COPY . .

# 安装项目
RUN pip install --no-cache-dir -e . && \
    pip install --no-cache-dir ".[test,lint,typing]" && \
    rm -rf /root/.cache/pip

# 最终阶段
FROM python:3.11-slim

# 复制虚拟环境
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY --from=builder /app /app

# 创建非 root 用户
RUN useradd -m -u 1000 jupyter \
    && chown -R jupyter:jupyter /app

USER jupyter

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]