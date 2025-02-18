from jupyter_nbmodel_client import NbModelClient

with NbModelClient(server_url="http://localhost:8888", token="123", path="notebooks/test.ipynb") as notebook:
    notebook.add_code_cell("print('hello world')")
    # notebook.add_markdown_cell("Hello")
