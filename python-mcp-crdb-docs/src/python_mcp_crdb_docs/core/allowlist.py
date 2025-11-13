"""Domain allowlist enforcement."""

from __future__ import annotations

from urllib.parse import urlparse

ALLOWED_HOST_SUFFIXES = (
    ".cockroachlabs.com",
    ".github.com",
    ".githubusercontent.com",
    ".algolia.net",
    ".algolianet.com",
)


class DomainBlockedError(RuntimeError):
    """Raised when a URL is outside the allowlist."""


def ensure_allowed(url: str) -> None:
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    for suffix in ALLOWED_HOST_SUFFIXES:
        if hostname == suffix.lstrip(".") or hostname.endswith(suffix):
            return
    raise DomainBlockedError(f"URL host '{hostname}' not in allowlist")
