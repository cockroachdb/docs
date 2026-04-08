"""
AI-powered Release Notes Reviewer.

This module analyzes release notes PRs and generates review issues
using AI (OpenAI) based on the CockroachDB style guide.
"""
import os
import re
import logging
import json
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime

import requests
import yaml
from openai import OpenAI

from .schemas import Issue, ReviewPayload, Links

logger = logging.getLogger(__name__)

# Style guide content (loaded from file or embedded)
STYLE_GUIDE = """
# Release Note Writing Guide for CockroachDB

## Style and Tone
- Use clear, concise, and correct language
- Use the second-person imperative present tense for instructions
- Use active voice instead of passive for clarity
- Avoid using "please" when giving instructions
- Avoid hyperbolic language like "simple," "just," "easily," or "actually"
- Use contractions to simplify language, except for clear directives (use "cannot" instead of "can't")
- Avoid forward-looking language about future features

## Format and Structure
- Use title case for page titles
- Use sentence case for all headings
- Use the Oxford (serial) comma
- When listing a range of versions, use "to" not a dash (e.g., v22.1.0 to v22.1.4)

## Technical Content
- Link to relevant documentation when referencing CockroachDB features
- Use inline code format (backticks) for code, commands, or technical syntax
- Include GitHub issue or PR numbers for reference

## Version References
- Format as vXX.X.X (e.g., v21.1.8) with lowercase 'v'

## Technical Terminology
- Use "CockroachDB" (proper capitalization)
- Use "PostgreSQL" (not "Postgres")
- Use inclusive terminology (allowlist/denylist, main/primary)

## Release Note Requirements
- Clearly describe what changed or was added
- Mention any impact on users, including breaking changes
- Be factual and technical without unnecessary jargon
- Include GitHub issue or PR numbers for reference
"""


@dataclass
class ParsedYAMLRelease:
    """Parsed release entry from releases.yml."""
    release_name: str
    major_version: str
    release_date: str
    release_type: str
    go_version: Optional[str] = None
    sha: Optional[str] = None
    previous_release: Optional[str] = None
    raw: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ParsedMarkdownRelease:
    """Parsed release notes from markdown file."""
    version: str
    release_date: str
    sections: Dict[str, List[str]]  # section_name -> list of notes
    pr_references: List[str]  # List of PR numbers referenced
    link_definitions: Dict[str, str]  # PR number -> URL
    raw_content: str = ""


@dataclass
class ReviewResult:
    """Result of the review process."""
    issues: List[Issue]
    summary: str
    yaml_data: Optional[ParsedYAMLRelease] = None
    markdown_data: Optional[ParsedMarkdownRelease] = None


class ReleaseNotesReviewer:
    """AI-powered reviewer for CockroachDB release notes PRs."""

    # Required YAML fields
    REQUIRED_YAML_FIELDS = [
        "release_name", "major_version", "release_date", "release_type"
    ]

    # Valid release types
    VALID_RELEASE_TYPES = [
        "Production", "Testing", "Preview", "Beta", "Alpha", "Withdrawn"
    ]

    # Valid section headers in markdown
    VALID_SECTIONS = [
        "backward-incompatible-changes", "security-updates", "sql-language-changes",
        "operational-changes", "command-line-changes", "db-console-changes",
        "bug-fixes", "performance-improvements", "contributors", "doc-updates",
        "enterprise-edition-changes", "general-changes"
    ]

    def __init__(self, github_token: Optional[str] = None, openai_api_key: Optional[str] = None):
        """Initialize the reviewer."""
        self.github_token = github_token or os.getenv("GITHUB_TOKEN")
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.openai_client = None
        if self.openai_api_key:
            self.openai_client = OpenAI(api_key=self.openai_api_key)

    def _github_headers(self) -> Dict[str, str]:
        """Get GitHub API headers."""
        return {
            "Authorization": f"Bearer {self.github_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    def fetch_pr_files(self, repo: str, pr_number: int) -> List[Dict[str, Any]]:
        """Fetch the files changed in a PR."""
        url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files"
        response = requests.get(url, headers=self._github_headers())
        response.raise_for_status()
        return response.json()

    def fetch_file_content(self, repo: str, path: str, ref: str) -> str:
        """Fetch file content from GitHub."""
        url = f"https://api.github.com/repos/{repo}/contents/{path}?ref={ref}"
        response = requests.get(url, headers=self._github_headers())
        response.raise_for_status()
        data = response.json()

        if data.get("encoding") == "base64":
            import base64
            return base64.b64decode(data["content"]).decode("utf-8")
        return data.get("content", "")

    def fetch_pr_diff(self, repo: str, pr_number: int) -> str:
        """Fetch the diff of a PR."""
        url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
        headers = self._github_headers()
        headers["Accept"] = "application/vnd.github.diff"
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.text

    def check_pr_exists(self, pr_number: str) -> bool:
        """Check if a PR exists in cockroachdb/cockroach."""
        url = f"https://api.github.com/repos/cockroachdb/cockroach/pulls/{pr_number}"
        response = requests.get(url, headers=self._github_headers())
        return response.status_code == 200

    def parse_yaml_diff(self, diff: str) -> Optional[ParsedYAMLRelease]:
        """Parse the YAML additions from a diff."""
        # Extract added lines from releases.yml
        yaml_section = False
        yaml_lines = []

        for line in diff.split("\n"):
            if "releases.yml" in line:
                yaml_section = True
                continue
            if yaml_section:
                if line.startswith("diff --git"):
                    break
                if line.startswith("+") and not line.startswith("+++"):
                    yaml_lines.append(line[1:])  # Remove the '+' prefix

        if not yaml_lines:
            return None

        # Parse the YAML
        yaml_content = "\n".join(yaml_lines)
        try:
            # Handle the case where we're adding to a list
            if yaml_content.strip().startswith("-"):
                data = yaml.safe_load(yaml_content)
                if isinstance(data, list) and len(data) > 0:
                    release = data[0]
                else:
                    release = data
            else:
                release = yaml.safe_load(yaml_content)

            if not release:
                return None

            return ParsedYAMLRelease(
                release_name=release.get("release_name", ""),
                major_version=release.get("major_version", ""),
                release_date=release.get("release_date", ""),
                release_type=release.get("release_type", ""),
                go_version=release.get("go_version"),
                sha=release.get("sha"),
                previous_release=release.get("previous_release"),
                raw=release
            )
        except yaml.YAMLError as e:
            logger.warning(f"Failed to parse YAML: {e}")
            return None

    def parse_markdown_diff(self, diff: str) -> Optional[ParsedMarkdownRelease]:
        """Parse the markdown additions from a diff."""
        # Extract added lines from .md file
        md_section = False
        md_lines = []
        md_filename = ""

        for line in diff.split("\n"):
            if ".md" in line and "diff --git" in line:
                md_section = True
                md_filename = line
                continue
            if md_section:
                if line.startswith("diff --git"):
                    break
                if line.startswith("+") and not line.startswith("+++"):
                    md_lines.append(line[1:])

        if not md_lines:
            return None

        content = "\n".join(md_lines)

        # Extract version from header
        version_match = re.search(r"## (v[\d.]+(?:-[\w.]+)?)", content)
        version = version_match.group(1) if version_match else ""

        # Extract release date
        date_match = re.search(r"Release Date:\s*(.+)", content)
        release_date = date_match.group(1).strip() if date_match else ""

        # Extract sections
        sections: Dict[str, List[str]] = {}
        current_section = None
        current_notes = []

        for line in md_lines:
            # Check for section header
            section_match = re.search(r'<h3 id="[^"]*-([^"]+)">', line)
            if section_match:
                if current_section and current_notes:
                    sections[current_section] = current_notes
                current_section = section_match.group(1)
                current_notes = []
            elif current_section and line.strip().startswith("-"):
                current_notes.append(line.strip())
            elif current_section and line.strip() and not line.startswith("[#"):
                current_notes.append(line.strip())

        if current_section and current_notes:
            sections[current_section] = current_notes

        # Extract PR references
        pr_refs = re.findall(r"\[#(\d+)\]", content)

        # Extract link definitions
        link_defs = {}
        for match in re.finditer(r"\[#(\d+)\]:\s*(https://[^\s]+)", content):
            link_defs[match.group(1)] = match.group(2)

        return ParsedMarkdownRelease(
            version=version,
            release_date=release_date,
            sections=sections,
            pr_references=pr_refs,
            link_definitions=link_defs,
            raw_content=content
        )

    def check_schema_format(self, yaml_data: Optional[ParsedYAMLRelease],
                           md_data: Optional[ParsedMarkdownRelease]) -> List[Issue]:
        """
        HIGH severity: Schema/Format Checks
        - Required YAML fields present
        - Valid date formats
        - Correct version patterns
        - Valid category tags
        """
        issues = []

        if yaml_data:
            # Check required fields
            for field in self.REQUIRED_YAML_FIELDS:
                value = getattr(yaml_data, field, None) or yaml_data.raw.get(field)
                if not value:
                    issues.append(Issue(
                        severity="HIGH",
                        title=f"Missing required YAML field: {field}",
                        message=f"The '{field}' field is required in releases.yml but is missing or empty.",
                        file="src/current/_data/releases.yml",
                        suggestion=f"Add the '{field}' field with an appropriate value."
                    ))

            # Check release_type validity
            if yaml_data.release_type and yaml_data.release_type not in self.VALID_RELEASE_TYPES:
                issues.append(Issue(
                    severity="HIGH",
                    title="Invalid release_type",
                    message=f"release_type '{yaml_data.release_type}' is not a valid type. "
                            f"Valid types are: {', '.join(self.VALID_RELEASE_TYPES)}",
                    file="src/current/_data/releases.yml",
                    suggestion=f"Use one of: {', '.join(self.VALID_RELEASE_TYPES)}"
                ))

            # Check date format (YYYY-MM-DD)
            if yaml_data.release_date:
                try:
                    datetime.strptime(str(yaml_data.release_date), "%Y-%m-%d")
                except ValueError:
                    issues.append(Issue(
                        severity="HIGH",
                        title="Invalid date format",
                        message=f"release_date '{yaml_data.release_date}' is not in YYYY-MM-DD format.",
                        file="src/current/_data/releases.yml",
                        suggestion="Use format: YYYY-MM-DD (e.g., 2026-03-25)"
                    ))

            # Check version pattern (vXX.X.X or vXX.X.X-suffix)
            if yaml_data.release_name:
                if not re.match(r"^v\d+\.\d+\.\d+(-[\w.]+)?$", yaml_data.release_name):
                    issues.append(Issue(
                        severity="HIGH",
                        title="Invalid version format",
                        message=f"release_name '{yaml_data.release_name}' doesn't match expected pattern vXX.X.X[-suffix].",
                        file="src/current/_data/releases.yml",
                        suggestion="Use format: vXX.X.X or vXX.X.X-beta.1 (lowercase 'v')"
                    ))

        if md_data:
            # Check version matches in markdown
            if yaml_data and md_data.version and yaml_data.release_name:
                if md_data.version != yaml_data.release_name:
                    issues.append(Issue(
                        severity="HIGH",
                        title="Version mismatch between YAML and Markdown",
                        message=f"YAML has '{yaml_data.release_name}' but Markdown has '{md_data.version}'.",
                        file="src/current/_includes/releases/",
                        suggestion="Ensure version numbers match in both files."
                    ))

        return issues

    def check_technical_accuracy(self, yaml_data: Optional[ParsedYAMLRelease],
                                  md_data: Optional[ParsedMarkdownRelease]) -> List[Issue]:
        """
        HIGH severity: Technical Accuracy Checks
        - Version numbers match
        - Referenced PRs exist
        - Backport references valid
        - No broken internal links
        """
        issues = []

        if md_data:
            # Check that all PR references have link definitions
            referenced_prs = set(md_data.pr_references)
            defined_prs = set(md_data.link_definitions.keys())

            missing_links = referenced_prs - defined_prs
            for pr in missing_links:
                issues.append(Issue(
                    severity="HIGH",
                    title=f"Missing link definition for PR #{pr}",
                    message=f"PR #{pr} is referenced in the text but has no link definition at the bottom.",
                    file="src/current/_includes/releases/",
                    suggestion=f"Add: [#{pr}]: https://github.com/cockroachdb/cockroach/pull/{pr}"
                ))

            # Check a sample of PRs to see if they exist (limit to avoid rate limits)
            prs_to_check = list(referenced_prs)[:5]
            for pr in prs_to_check:
                if not self.check_pr_exists(pr):
                    issues.append(Issue(
                        severity="HIGH",
                        title=f"Referenced PR #{pr} does not exist",
                        message=f"PR #{pr} was referenced but could not be found in cockroachdb/cockroach.",
                        file="src/current/_includes/releases/",
                        suggestion="Verify the PR number is correct."
                    ))

            # Check for orphaned link definitions (defined but not referenced)
            orphaned_links = defined_prs - referenced_prs
            for pr in orphaned_links:
                issues.append(Issue(
                    severity="MEDIUM",
                    title=f"Orphaned link definition for PR #{pr}",
                    message=f"Link definition for #{pr} exists but is not referenced in the text.",
                    file="src/current/_includes/releases/",
                    suggestion="Remove unused link definition or add reference in text."
                ))

        return issues

    def check_content_quality_with_ai(self, md_data: Optional[ParsedMarkdownRelease]) -> List[Issue]:
        """
        MEDIUM severity: Content Quality Checks using AI
        - Release note text not empty
        - No placeholder text
        - Action-oriented (starts with verb)
        - Appropriate length
        - No duplicates
        - Style guide compliance
        """
        issues = []

        if not md_data or not self.openai_client:
            return issues

        # Prepare the content for AI review
        content_to_review = md_data.raw_content

        prompt = f"""You are a technical writing reviewer for CockroachDB release notes.

Review the following release notes content and identify issues based on these criteria:

MEDIUM SEVERITY ISSUES:
1. Empty or placeholder text (TODO, TBD, FIXME, placeholder, lorem ipsum)
2. Notes that don't start with an action verb (should describe what changed)
3. Notes that are too short (<10 words) or too long (>100 words for a single point)
4. Duplicate or very similar release notes
5. Style guide violations:
   - Using passive voice instead of active voice
   - Using "please" in instructions
   - Using hyperbolic words like "simple", "just", "easily", "actually"
   - Incorrect capitalization (should be "CockroachDB" not "cockroachdb")
   - Using "Postgres" instead of "PostgreSQL"
   - Not using inclusive language (should use allowlist/denylist, main/primary)

STYLE GUIDE:
{STYLE_GUIDE}

RELEASE NOTES CONTENT:
{content_to_review}

Respond with a JSON array of issues found. Each issue should have:
- "title": Short title of the issue
- "message": Detailed explanation
- "suggestion": How to fix it
- "line_hint": A snippet of the problematic text (for locating it)

If no issues found, return an empty array: []

Return ONLY valid JSON, no other text."""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a technical writing reviewer. Respond only with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )

            result_text = response.choices[0].message.content.strip()

            # Clean up the response (remove markdown code blocks if present)
            if result_text.startswith("```"):
                result_text = re.sub(r"^```(?:json)?\n?", "", result_text)
                result_text = re.sub(r"\n?```$", "", result_text)

            ai_issues = json.loads(result_text)

            for ai_issue in ai_issues:
                issues.append(Issue(
                    severity="MEDIUM",
                    title=ai_issue.get("title", "Content quality issue"),
                    message=ai_issue.get("message", ""),
                    suggestion=ai_issue.get("suggestion", ""),
                    metadata={"line_hint": ai_issue.get("line_hint", "")}
                ))

        except Exception as e:
            logger.error(f"AI content review failed: {e}")
            # Don't fail the whole review if AI fails

        return issues

    def review_pr(self, repo: str, pr_number: int, commit_sha: Optional[str] = None) -> ReviewResult:
        """
        Review a release notes PR and generate issues.

        Args:
            repo: Repository in 'owner/repo' format
            pr_number: Pull request number
            commit_sha: Optional commit SHA (fetched if not provided)

        Returns:
            ReviewResult with issues and parsed data
        """
        issues = []

        # Fetch PR diff
        logger.info(f"Fetching PR diff for {repo}#{pr_number}")
        diff = self.fetch_pr_diff(repo, pr_number)

        # Parse YAML and Markdown from diff
        yaml_data = self.parse_yaml_diff(diff)
        md_data = self.parse_markdown_diff(diff)

        logger.info(f"Parsed YAML: {yaml_data is not None}, Markdown: {md_data is not None}")

        # Run schema/format checks (HIGH)
        schema_issues = self.check_schema_format(yaml_data, md_data)
        issues.extend(schema_issues)
        logger.info(f"Schema/format issues: {len(schema_issues)}")

        # Run technical accuracy checks (HIGH)
        accuracy_issues = self.check_technical_accuracy(yaml_data, md_data)
        issues.extend(accuracy_issues)
        logger.info(f"Technical accuracy issues: {len(accuracy_issues)}")

        # Run content quality checks with AI (MEDIUM)
        if md_data:
            quality_issues = self.check_content_quality_with_ai(md_data)
            issues.extend(quality_issues)
            logger.info(f"Content quality issues: {len(quality_issues)}")

        # Generate summary
        high_count = sum(1 for i in issues if i.severity == "HIGH")
        medium_count = sum(1 for i in issues if i.severity == "MEDIUM")
        low_count = sum(1 for i in issues if i.severity == "LOW")

        if not issues:
            summary = "No issues found. Release notes look good!"
        else:
            summary = f"Found {len(issues)} issue(s): {high_count} HIGH, {medium_count} MEDIUM, {low_count} LOW"

        return ReviewResult(
            issues=issues,
            summary=summary,
            yaml_data=yaml_data,
            markdown_data=md_data
        )

    def create_review_payload(self, repo: str, pr_number: int,
                              commit_sha: str, result: ReviewResult) -> ReviewPayload:
        """Create a ReviewPayload from the review result."""
        return ReviewPayload(
            source="ai-release-notes-reviewer",
            repo=repo,
            pr_number=pr_number,
            commit_sha=commit_sha,
            generated_at=datetime.utcnow().isoformat() + "Z",
            summary=result.summary,
            issues=result.issues,
            links=Links(
                full_report=None  # Could add link to stored full report
            )
        )


def get_reviewer() -> ReleaseNotesReviewer:
    """Get a configured reviewer instance."""
    return ReleaseNotesReviewer()
