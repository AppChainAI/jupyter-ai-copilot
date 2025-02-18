from jupyter_nbmodel_client import NbModelClient
from jupyter_kernel_client import KernelClient
from autogen_agentchat.agents import AssistantAgent
from autogen_core import CancellationToken
from autogen_ext.models.openai import OpenAIChatCompletionClient
from utils.tools import add_code_cell_tool, add_markdown_cell_tool
from utils.retriever import retrieve_cells_content_until_first_error
import os
from typing import AsyncGenerator, Union


class NotebookAgent:
    """笔记本代理类，用于管理笔记本操作和生成响应"""
    
    SYSTEM_PROMPT = """You are a powerful coding assistant.
    Create and execute code in a notebook based on user instructions.
    Add markdown cells to explain the code and structure the notebook clearly.
    Assume that no packages are installed in the notebook, so install them using !pip install."""

    def __init__(self, notebook: NbModelClient, kernel: KernelClient):
        """初始化笔记本代理
        
        Args:
            notebook: 笔记本客户端
            kernel: kernel客户端
        """
        self.notebook = notebook
        self.kernel = kernel
        
    def add_code_cell(self, cell_content: str) -> None:
        """添加代码单元格并执行"""
        print("== Call tool add_code_cell ==")
        print(cell_content)
        print("== End of tool add_code_cell ==")
        return add_code_cell_tool(self.notebook, self.kernel, cell_content)
    
    def add_markdown_cell(self, cell_content: str) -> None:
        """添加 Markdown 单元格"""
        print("== Call tool add_markdown_cell ==")
        print(cell_content)
        print("== End of tool add_markdown_cell ==")
        return add_markdown_cell_tool(self.notebook, cell_content)
    
    async def prompt(self, input: str, full_context: bool) -> AsyncGenerator[Union[str, dict], None]:
        """从给定指令生成代码和 markdown 单元格，并添加到笔记本中
        
        Args:
            input: 用户输入的提示
            full_context: 是否包含完整上下文
            
        Returns:
            AsyncGenerator[Union[str, dict], None]: 返回字符串或字典类型的流式生成器
        """
        try:
            # 创建使用 OpenAI GPT 模型的代理
            model_client = OpenAIChatCompletionClient(
                model="Qwen/Qwen2.5-32B-Instruct",
                base_url="https://api.siliconflow.cn/v1",
                api_key=os.getenv("OPENAI_API_KEY"),
                model_info={
                    "vision": False,
                    "function_calling": True,
                    "json_output": True,
                    "family": "unknown",
                },
            )

            if full_context:
                system_prompt_final = f"""
                {self.SYSTEM_PROMPT}
                
                Notebook content: {retrieve_cells_content_until_first_error(self.notebook)[0]}
                """
            else:
                system_prompt_final = self.SYSTEM_PROMPT

            # 创建 agent
            agent = AssistantAgent(
                name="jupyter_agent",
                model_client=model_client,
                model_client_stream=False,
                tools=[self.add_code_cell, self.add_markdown_cell],
                system_message=system_prompt_final
            )
            
            # 运行 agent 并返回流式响应
            async for chunk in agent.run_stream(
                task=input, cancellation_token=CancellationToken()):
                # print(chunk)
                if hasattr(chunk, 'type') and hasattr(chunk, 'source'):
                    if chunk.source == 'user' or chunk.type != "TextMessage":
                        continue
                    yield {
                        "source": chunk.source,
                        "content": chunk.content
                    }

        except Exception as e:
            yield {"error": str(e)}
