.PHONY: install lint test run docker-build

install:
pip install -e .[dev]

lint:
python -m compileall src

test:
pytest

run:
python -m python_mcp_crdb_docs.server

docker-build:
docker build -t python-mcp-crdb-docs .
