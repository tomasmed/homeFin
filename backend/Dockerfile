FROM python:3.11-slim
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY main.py .
COPY app/ ./app/
CMD ["uv" , "run" , "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]