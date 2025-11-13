FROM python:3.11-slim AS build
WORKDIR /app
COPY pyproject.toml README.md ./
COPY src ./src
RUN pip install --upgrade pip && pip install .

FROM gcr.io/distroless/python3
ENV PYTHONPATH=/usr/local/lib/python3.11/site-packages
WORKDIR /app
COPY --from=build /usr/local /usr/local
COPY --from=build /app/src /app/src
ENTRYPOINT ["python", "-m", "python_mcp_crdb_docs.server"]
