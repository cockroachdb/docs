"""Data models for SQL testing infrastructure."""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional


class BlockType(Enum):
    """Classification of a SQL code block."""
    EXECUTABLE = "executable"
    EXPECTED_ERROR = "expected_error"
    FRAGMENT = "fragment"
    SKIPPED = "skipped"


@dataclass
class SqlBlock:
    """A single SQL code block extracted from a markdown file."""
    file_path: str
    line_number: int
    raw_content: str
    cleaned_statements: List[str]
    block_type: BlockType
    expected_output: Optional[str] = None
    skip_reason: Optional[str] = None
    block_index: int = 0


@dataclass
class TestResult:
    """Result of executing a single SQL block."""
    block: SqlBlock
    success: bool
    actual_output: str = ""
    error_message: str = ""
    execution_time_ms: float = 0.0


@dataclass
class PageResult:
    """Aggregated results for all SQL blocks in a single file."""
    file_path: str
    blocks: List[SqlBlock] = field(default_factory=list)
    results: List[TestResult] = field(default_factory=list)
