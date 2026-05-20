"""Data models for SQL testing infrastructure."""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Tuple


class BlockType(Enum):
    """Classification of a SQL code block."""
    EXECUTABLE = "executable"
    EXPECTED_ERROR = "expected_error"
    FRAGMENT = "fragment"
    SKIPPED = "skipped"


class ResponseMode(Enum):
    """Whether a block's output should be auto-generated."""
    MANUAL = "manual"
    GENERATE = "generate"
    SKIP = "skip"


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
    response_mode: ResponseMode = ResponseMode.MANUAL
    output_block_range: Optional[Tuple[int, int]] = None  # (start_line, end_line) 0-indexed, inclusive of ~~~ delimiters


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
