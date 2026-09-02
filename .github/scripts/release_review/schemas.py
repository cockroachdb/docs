"""
Pydantic models for the /api/v1/release-review-results endpoint.

This module defines the request and response schemas for receiving
AI-generated release-notes reviews and posting them to GitHub.
"""
import re
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, HttpUrl, field_validator
from datetime import datetime


# -----------------------------------------------------------------------------
# Request Models
# -----------------------------------------------------------------------------

class Issue(BaseModel):
    """A single review issue found by the AI."""
    severity: Literal["HIGH", "MEDIUM", "LOW"] = Field(
        ..., description="Severity level of the issue"
    )
    title: str = Field(..., description="Short title of the issue")
    message: str = Field(..., description="Detailed message describing the issue")
    file: Optional[str] = Field(None, description="File path where the issue was found")
    line: Optional[int] = Field(None, description="Line number in the file")
    suggestion: Optional[str] = Field(None, description="Suggested fix for the issue")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class Annotation(BaseModel):
    """A GitHub check run annotation."""
    path: str = Field(..., description="File path for the annotation")
    start_line: int = Field(..., ge=1, description="Starting line number")
    end_line: Optional[int] = Field(None, description="Ending line number")
    annotation_level: Literal["notice", "warning", "failure"] = Field(
        ..., description="Annotation severity level"
    )
    message: str = Field(..., description="Annotation message")


class Links(BaseModel):
    """Optional links to related resources."""
    deploy_preview: Optional[HttpUrl] = Field(None, description="Deploy preview URL")
    full_report: Optional[HttpUrl] = Field(None, description="Full JSON report URL")


class ReviewPayload(BaseModel):
    """Request payload for the release review results endpoint."""
    source: str = Field(..., description="Source identifier of the review system")
    repo: str = Field(..., description="Repository in 'owner/repo' format")
    pr_number: int = Field(..., ge=1, description="Pull request number")
    commit_sha: Optional[str] = Field(None, description="Git commit SHA (40 hex chars)")
    generated_at: str = Field(..., description="ISO8601 datetime when review was generated")
    summary: Optional[str] = Field(None, description="Short summary of the review")
    issues: List[Issue] = Field(default_factory=list, description="List of issues found")
    annotations: Optional[List[Annotation]] = Field(
        default_factory=list, description="GitHub annotations for the check run"
    )
    links: Optional[Links] = Field(None, description="Related links")
    idempotency_key: Optional[str] = Field(
        None, description="Idempotency key from payload (fallback)"
    )

    @field_validator("repo")
    @classmethod
    def validate_repo_format(cls, v: str) -> str:
        """Validate repo is in 'owner/repo' format."""
        if not re.match(r"^[^/]+/[^/]+$", v):
            raise ValueError("repo must be in 'owner/repo' format")
        return v

    @field_validator("commit_sha")
    @classmethod
    def validate_commit_sha(cls, v: Optional[str]) -> Optional[str]:
        """Validate commit SHA is 40 hex characters if provided."""
        if v is not None and not re.match(r"^[0-9a-f]{40}$", v.lower()):
            raise ValueError("commit_sha must be 40 hexadecimal characters")
        return v.lower() if v else None

    @field_validator("generated_at")
    @classmethod
    def validate_generated_at(cls, v: str) -> str:
        """Validate generated_at is a valid ISO8601 datetime."""
        try:
            # Try parsing the datetime
            datetime.fromisoformat(v.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError("generated_at must be a valid ISO8601 datetime")
        return v


# -----------------------------------------------------------------------------
# Response Models
# -----------------------------------------------------------------------------

class ReviewResponse(BaseModel):
    """Response from the release review results endpoint."""
    status: Literal["ok", "error"] = Field(..., description="Response status")
    check_run_id: Optional[int] = Field(None, description="GitHub check run ID")
    comment_id: Optional[int] = Field(None, description="GitHub PR comment ID")
    message: str = Field(..., description="Human-readable message")


class ErrorResponse(BaseModel):
    """Error response model."""
    status: Literal["error"] = "error"
    message: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")


# -----------------------------------------------------------------------------
# Internal Models
# -----------------------------------------------------------------------------

class Job(BaseModel):
    """Internal job representation for the store."""
    id: Optional[int] = None
    idempotency_key: str
    repo: str
    pr_number: int
    created_at: datetime
    processed_at: Optional[datetime] = None
    check_run_id: Optional[int] = None
    comment_id: Optional[int] = None
    payload_json: str
    status: Literal["pending", "processing", "completed", "failed"] = "pending"
    error_message: Optional[str] = None
