"""Structured logging helpers for the MCP server."""

from __future__ import annotations

import json
import os
import sys
import time
from typing import Any, Dict

_LOG_LEVEL = os.getenv("FASTMCP_LOG_LEVEL", "INFO").upper()
_LEVELS = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40}


def _should_log(level: str) -> bool:
    return _LEVELS.get(level, 20) >= _LEVELS.get(_LOG_LEVEL, 20)


def log(level: str, message: str, **fields: Any) -> None:
    """Emit a JSON log line."""
    if not _should_log(level):
        return
    payload: Dict[str, Any] = {
        "level": level,
        "message": message,
        "time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if fields:
        payload.update(fields)
    json.dump(payload, sys.stdout)
    sys.stdout.write("\n")
    sys.stdout.flush()


def info(message: str, **fields: Any) -> None:
    log("INFO", message, **fields)


def warning(message: str, **fields: Any) -> None:
    log("WARNING", message, **fields)


def error(message: str, **fields: Any) -> None:
    log("ERROR", message, **fields)


def debug(message: str, **fields: Any) -> None:
    log("DEBUG", message, **fields)
