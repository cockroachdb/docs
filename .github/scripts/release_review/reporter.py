"""
Reporter for formatting check run outputs and PR comments.

Builds the check run summary/annotations and the PR comment body
from the review payload.
"""
import logging
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass

from .schemas import ReviewPayload, Issue, Annotation
from .config import get_config
from .github_client import CheckRunOutput

logger = logging.getLogger(__name__)


@dataclass
class SeverityCounts:
    """Counts of issues by severity."""
    high: int = 0
    medium: int = 0
    low: int = 0

    def total(self) -> int:
        return self.high + self.medium + self.low

    def summary_line(self) -> str:
        return f"High: {self.high}  ·  Medium: {self.medium}  ·  Low: {self.low}"


class Reporter:
    """Formats review results for GitHub."""

    def __init__(self):
        self.config = get_config()

    def count_severities(self, issues: List[Issue]) -> SeverityCounts:
        """Count issues by severity level."""
        counts = SeverityCounts()
        for issue in issues:
            if issue.severity == "HIGH":
                counts.high += 1
            elif issue.severity == "MEDIUM":
                counts.medium += 1
            elif issue.severity == "LOW":
                counts.low += 1
        return counts

    def build_check_output(self, payload: ReviewPayload) -> CheckRunOutput:
        """
        Build the check run output from the review payload.

        Args:
            payload: The review payload

        Returns:
            CheckRunOutput with title, summary, and annotations
        """
        counts = self.count_severities(payload.issues)

        # Build title
        title = self.config.github.check_run_title

        # Build summary
        summary_parts = [counts.summary_line()]

        if payload.summary:
            summary_parts.append("")
            summary_parts.append(payload.summary)

        # Add up to 10 example issues in summary
        if payload.issues:
            summary_parts.append("")
            summary_parts.append("**Sample issues:**")
            for issue in payload.issues[:10]:
                location = ""
                if issue.file:
                    location = f" (`{issue.file}"
                    if issue.line:
                        location += f":{issue.line}"
                    location += "`)"
                summary_parts.append(f"- [{issue.severity}] {issue.title}{location}")

            if len(payload.issues) > 10:
                summary_parts.append(f"- ... and {len(payload.issues) - 10} more")

        summary = "\n".join(summary_parts)

        # Build annotations
        annotations = self._build_annotations(payload)

        return CheckRunOutput(
            title=title,
            summary=summary,
            annotations=annotations
        )

    def _build_annotations(self, payload: ReviewPayload) -> List[Dict[str, Any]]:
        """Build GitHub annotations from issues and explicit annotations."""
        annotations = []

        # First, add explicit annotations from the payload
        if payload.annotations:
            for ann in payload.annotations:
                annotations.append({
                    "path": ann.path,
                    "start_line": ann.start_line,
                    "end_line": ann.end_line or ann.start_line,
                    "annotation_level": ann.annotation_level,
                    "message": ann.message
                })

        # Then, create annotations from issues that have file/line info
        for issue in payload.issues:
            if issue.file and issue.line:
                # Map severity to annotation level
                level = self._severity_to_annotation_level(issue.severity)

                message = f"{issue.title}: {issue.message}"
                if issue.suggestion:
                    message += f"\n\nSuggestion: {issue.suggestion}"

                annotations.append({
                    "path": issue.file,
                    "start_line": issue.line,
                    "end_line": issue.line,
                    "annotation_level": level,
                    "message": message
                })

        # Warn if we have too many annotations
        max_annotations = self.config.github.max_annotations
        if len(annotations) > max_annotations:
            logger.warning(
                f"Payload has {len(annotations)} annotations, "
                f"but GitHub only accepts {max_annotations}. Truncating."
            )

        return annotations

    def _severity_to_annotation_level(self, severity: str) -> str:
        """Map issue severity to GitHub annotation level."""
        mapping = {
            "HIGH": self.config.severity_mapping.high,
            "MEDIUM": self.config.severity_mapping.medium,
            "LOW": self.config.severity_mapping.low,
        }
        return mapping.get(severity, "notice")

    def build_comment_body(self, payload: ReviewPayload) -> str:
        """
        Build the PR comment body from the review payload.

        Args:
            payload: The review payload

        Returns:
            Markdown-formatted comment body
        """
        counts = self.count_severities(payload.issues)
        marker = self.config.github.bot_comment_marker

        # Start with marker and header
        lines = [
            marker,
            f"**Release Notes Advisory (AI)** — {payload.summary or 'Review complete'}",
            "",
            counts.summary_line(),
            "",
        ]

        # Group issues by severity
        high_issues = [i for i in payload.issues if i.severity == "HIGH"]
        medium_issues = [i for i in payload.issues if i.severity == "MEDIUM"]
        low_issues = [i for i in payload.issues if i.severity == "LOW"]

        # Add each severity section
        if high_issues:
            lines.extend(self._format_issue_section("HIGH", high_issues))

        if medium_issues:
            lines.extend(self._format_issue_section("MEDIUM", medium_issues))

        if low_issues:
            lines.extend(self._format_issue_section("LOW", low_issues))

        # Add links section
        if payload.links:
            lines.append("---")
            lines.append("")
            lines.append("**Links**")
            if payload.links.deploy_preview:
                lines.append(f"- [Deploy Preview]({payload.links.deploy_preview})")
            if payload.links.full_report:
                lines.append(f"- [Full JSON Report]({payload.links.full_report})")
            lines.append("")

        # Footer
        lines.append("---")
        lines.append("_Posted by docs-fast-agent — advisory only, does not block merge._")

        return "\n".join(lines)

    def _format_issue_section(
        self,
        severity: str,
        issues: List[Issue]
    ) -> List[str]:
        """Format a section of issues for the PR comment."""
        lines = [
            f"### {severity} ({len(issues)})",
            "",
        ]

        for issue in issues:
            # Title and message
            lines.append(f"- **{issue.title}:** {issue.message}")

            # File and line
            if issue.file:
                location = f"`{issue.file}"
                if issue.line:
                    location += f":{issue.line}"
                location += "`"
                lines.append(f"  {location}")

            # Suggestion
            if issue.suggestion:
                lines.append(f"  **Suggestion:** {issue.suggestion}")

            lines.append("")

        return lines


# Global reporter instance
_reporter: Reporter = None


def get_reporter() -> Reporter:
    """Get the global reporter instance."""
    global _reporter
    if _reporter is None:
        _reporter = Reporter()
    return _reporter


def reset_reporter() -> None:
    """Reset the global reporter (useful for testing)."""
    global _reporter
    _reporter = None
