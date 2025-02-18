from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import logging
from jupyter_nbmodel_client import NbModelClient
from jupyter_kernel_client import KernelClient
import json
from agents.prompt_agent import NotebookAgent


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai/agent", tags=["ai_agent"])

class PromptRequest(BaseModel):
    server_url: str = "http://localhost:8888"
    token: str = ""
    path: str
    input: str
    full_context: Optional[bool] = False

@router.post("/prompt")
async def stream_prompt(request: PromptRequest):
    """执行流式生成响应的 prompt 命令"""
    kernel = None
    notebook = None
    try:
        # 初始化客户端
        kernel = KernelClient(server_url=request.server_url, token=request.token)
        kernel.start()
        notebook = NbModelClient(server_url=request.server_url, token=request.token, path=request.path)
        notebook.start()

        # 创建 NotebookAgent 实例
        agent = NotebookAgent(notebook, kernel)

        # 执行 prompt
        reply_stream = agent.prompt(
            request.input,
            request.full_context
        )

        async def format_sse():
            try:
                async for chunk in reply_stream:
                    if isinstance(chunk, dict):
                        yield f"data: {json.dumps(chunk)}\n\n"
                    else:
                        yield f"data: {chunk}\n\n"
            except Exception as e:
                logger.error(f"Stream error: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                if notebook:
                    notebook.stop()
                if kernel:
                    kernel.stop()

        return StreamingResponse(format_sse(), media_type="text/event-stream")
        
    except Exception as e:
        logger.error(f"Exception in stream-prompt: {str(e)}")
        if notebook:
            notebook.stop()
        if kernel:
            kernel.stop()
        raise HTTPException(status_code=500, detail=str(e))

