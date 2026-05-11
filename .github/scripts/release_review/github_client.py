"""
GitHub API client for the release review service.

Handles creating check runs, posting/updating PR comments, and fetching PR info.
"""
import logging
import time
from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .config import get_config
from .schemas import ReviewPayload, Annotation

logger = logging.getLogger(__name__)


class GitHubAPIError(Exception):
    """Exception for GitHub API errors."""

    def __init__(self, message: str, status_code: int = 0, retry_after: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code
        self.retry_after = retry_after


class GitHubRateLimitError(GitHubAPIError):
    """Exception for GitHub rate limit errors."""
    pass


@dataclass
class CheckRunOutput:
    """Output data for a GitHub check run."""
    title: str
    summary: str
    annotations: List[Dict[str, Any]]


class GitHubClient:
    """Client for interacting with GitHub API."""

    BASE_URL = "https://api.github.com"

    def __init__(self, token: Optional[str] = None):
        """Initialize the GitHub client."""
        config = get_config()
        self.token = token or config.github.token
        self.config = config.github

        # Set up session with retry logic
        self.session = requests.Session()
        retry_strategy = Retry(
            total=2,
            backoff_factor=0.5,
            status_forcelist=[500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

    def _headers(self) -> Dict[str, str]:
        """Get the headers for GitHub API requests."""
        return {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    def _handle_response(self, response: requests.Response) -> Dict[str, Any]:
        """Handle GitHub API response and raise appropriate errors."""
        # Check for rate limiting
        if response.status_code in (403, 429):
            remaining = response.headers.get("X-RateLimit-Remaining", "unknown")
            retry_after = response.headers.get("Retry-After")

            if remaining == "0" or response.status_code == 429:
                retry_seconds = int(retry_after) if retry_after else 60
                raise GitHubRateLimitError(
                    f"GitHub rate limit exceeded. Retry after {retry_seconds}s",
                    status_code=response.status_code,
                    retry_after=retry_seconds
                )

        # Check for other errors
        if not response.ok:
            try:
                error_data = response.json()
                message = error_data.get("message", response.text)
            except Exception:
                message = response.text

            raise GitHubAPIError(
                f"GitHub API error: {message}",
                status_code=response.status_code
            )

        return response.json()

    def get_pr_head_sha(self, repo: str, pr_number: int) -> str:
        """
        Get the head SHA of a pull request.

        Args:
            repo: Repository in 'owner/repo' format
            pr_number: Pull request number

        Returns:
            The head commit SHA
        """
        url = f"{self.BASE_URL}/repos/{repo}/pulls/{pr_number}"
        logger.debug(f"Fetching PR info: {url}")

        response = self.session.get(url, headers=self._headers())
        data = self._handle_response(response)

        return data["head"]["sha"]

    def create_check_run(
        self,
        repo: str,
        head_sha: str,
        output: CheckRunOutput
    ) -> int:
        """
        Create a GitHub check run with neutral conclusion.

        Args:
            repo: Repository in 'owner/repo' format
            head_sha: The commit SHA to attach the check run to
            output: Check run output data

        Returns:
            The check run ID
        """
        url = f"{self.BASE_URL}/repos/{repo}/check-runs"

        # Truncate annotations to max allowed
        annotations = output.annotations[:self.config.max_annotations]
        if len(output.annotations) > self.config.max_annotations:
            logger.warning(
                f"Truncating annotations from {len(output.annotations)} "
                f"to {self.config.max_annotations}"
            )

        # Truncate annotation messages
        for ann in annotations:
            if len(ann.get("message", "")) > self.config.max_annotation_message_length:
                ann["message"] = (
                    ann["message"][:self.config.max_annotation_message_length - 3] + "..."
                )

        payload = {
            "name": self.config.check_run_name,
            "head_sha": head_sha,
            "status": "completed",
            "conclusion": "neutral",
            "output": {
                "title": output.title,
                "summary": output.summary,
                "annotations": annotations
            }
        }

        logger.debug(f"Creating check run: {url}")
        response = self.session.post(url, headers=self._headers(), json=payload)
        data = self._handle_response(response)

        check_run_id = data["id"]
        logger.info(f"Created check run {check_run_id} for {repo}")
        return check_run_id

    def find_bot_comment(self, repo: str, pr_number: int) -> Optional[int]:
        """
        Find an existing bot comment on the PR.

        Looks for a comment containing the bot marker.

        Args:
            repo: Repository in 'owner/repo' format
            pr_number: Pull request number

        Returns:
            The comment ID if found, None otherwise
        """
        url = f"{self.BASE_URL}/repos/{repo}/issues/{pr_number}/comments"
        logger.debug(f"Searching for bot comment: {url}")

        # Paginate through comments
        page = 1
        per_page = 100

        while True:
            response = self.session.get(
                url,
                headers=self._headers(),
                params={"page": page, "per_page": per_page}
            )
            comments = self._handle_response(response)

            if not comments:
                break

            for comment in comments:
                body = comment.get("body", "")
                if self.config.bot_comment_marker in body:
                    logger.debug(f"Found existing bot comment: {comment['id']}")
                    return comment["id"]

            if len(comments) < per_page:
                break

            page += 1

        return None

    def create_comment(self, repo: str, pr_number: int, body: str) -> int:
        """
        Create a new PR comment.

        Args:
            repo: Repository in 'owner/repo' format
            pr_number: Pull request number
            body: Comment body (markdown)

        Returns:
            The comment ID
        """
        url = f"{self.BASE_URL}/repos/{repo}/issues/{pr_number}/comments"
        logger.debug(f"Creating comment: {url}")

        response = self.session.post(
            url,
            headers=self._headers(),
            json={"body": body}
        )
        data = self._handle_response(response)

        comment_id = data["id"]
        logger.info(f"Created comment {comment_id} on PR {pr_number}")
        return comment_id

    def update_comment(self, repo: str, comment_id: int, body: str) -> int:
        """
        Update an existing PR comment.

        Args:
            repo: Repository in 'owner/repo' format
            comment_id: The comment ID to update
            body: New comment body (markdown)

        Returns:
            The comment ID
        """
        url = f"{self.BASE_URL}/repos/{repo}/issues/comments/{comment_id}"
        logger.debug(f"Updating comment: {url}")

        response = self.session.patch(
            url,
            headers=self._headers(),
            json={"body": body}
        )
        self._handle_response(response)

        logger.info(f"Updated comment {comment_id}")
        return comment_id

    def create_or_update_comment(self, repo: str, pr_number: int, body: str) -> int:
        """
        Create a new comment or update existing bot comment.

        Args:
            repo: Repository in 'owner/repo' format
            pr_number: Pull request number
            body: Comment body (markdown)

        Returns:
            The comment ID (new or existing)
        """
        existing_comment_id = self.find_bot_comment(repo, pr_number)

        if existing_comment_id:
            return self.update_comment(repo, existing_comment_id, body)
        else:
            return self.create_comment(repo, pr_number, body)


# Global client instance (lazy loaded)
_client: Optional[GitHubClient] = None


def get_github_client() -> GitHubClient:
    """Get the global GitHub client instance."""
    global _client
    if _client is None:
        _client = GitHubClient()
    return _client


def reset_github_client() -> None:
    """Reset the global GitHub client (useful for testing)."""
    global _client
    _client = None
