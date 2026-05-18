"""
Configuration settings for the release review service.

Loads settings from environment variables and optional YAML config file.
"""
import os
from pathlib import Path
from typing import Dict, Optional
from dataclasses import dataclass, field

import yaml


@dataclass
class GitHubConfig:
    """GitHub-related configuration."""
    token: str = ""
    check_run_name: str = "Release Notes Review (AI)"
    check_run_title: str = "Advisory Release Notes Review (AI)"
    max_annotations: int = 50
    max_annotation_message_length: int = 640
    bot_comment_marker: str = "<!-- docs-fast-agent-comment -->"


@dataclass
class SecurityConfig:
    """Security-related configuration."""
    docs_agent_secret: str = ""
    signature_header: str = "X-Docs-Agent-Signature"
    idempotency_header: str = "X-Idempotency-Key"


@dataclass
class StoreConfig:
    """Storage configuration."""
    db_path: str = "docs_agent.db"
    stale_job_ttl_seconds: int = 3600  # 1 hour


@dataclass
class FeatureFlags:
    """Feature flags for the service."""
    post_comments: bool = True
    post_check_runs: bool = True


@dataclass
class SeverityMapping:
    """Mapping of severity levels to GitHub annotation levels."""
    high: str = "failure"
    medium: str = "warning"
    low: str = "notice"


@dataclass
class ReleaseReviewConfig:
    """Main configuration for the release review service."""
    github: GitHubConfig = field(default_factory=GitHubConfig)
    security: SecurityConfig = field(default_factory=SecurityConfig)
    store: StoreConfig = field(default_factory=StoreConfig)
    features: FeatureFlags = field(default_factory=FeatureFlags)
    severity_mapping: SeverityMapping = field(default_factory=SeverityMapping)

    @classmethod
    def from_env(cls, config_path: Optional[str] = None) -> "ReleaseReviewConfig":
        """
        Load configuration from environment variables and optional YAML file.

        Environment variables take precedence over YAML config.
        """
        config = cls()

        # Load from YAML if path provided or default exists
        yaml_path = config_path or os.getenv("RELEASE_REVIEWER_CONFIG")
        if yaml_path and Path(yaml_path).exists():
            config = cls._load_yaml(yaml_path, config)
        else:
            # Check default locations
            default_paths = [
                Path("config/release-reviewer.yml"),
                Path("config/release-reviewer.yaml"),
            ]
            for path in default_paths:
                if path.exists():
                    config = cls._load_yaml(str(path), config)
                    break

        # Override with environment variables
        config.github.token = os.getenv("GITHUB_TOKEN", config.github.token)
        config.security.docs_agent_secret = os.getenv(
            "DOCS_AGENT_SECRET", config.security.docs_agent_secret
        )
        config.store.db_path = os.getenv("DOCS_AGENT_DB", config.store.db_path)

        # Feature flags from env
        post_comments = os.getenv("POST_COMMENTS")
        if post_comments is not None:
            config.features.post_comments = post_comments.lower() in ("true", "1", "yes")

        post_check_runs = os.getenv("POST_CHECK_RUNS")
        if post_check_runs is not None:
            config.features.post_check_runs = post_check_runs.lower() in ("true", "1", "yes")

        return config

    @classmethod
    def _load_yaml(cls, path: str, config: "ReleaseReviewConfig") -> "ReleaseReviewConfig":
        """Load configuration from YAML file."""
        try:
            with open(path, "r") as f:
                data = yaml.safe_load(f) or {}

            # GitHub settings
            if "github" in data:
                gh = data["github"]
                config.github.check_run_name = gh.get(
                    "check_run_name", config.github.check_run_name
                )
                config.github.check_run_title = gh.get(
                    "check_run_title", config.github.check_run_title
                )
                config.github.max_annotations = gh.get(
                    "max_annotations", config.github.max_annotations
                )
                config.github.max_annotation_message_length = gh.get(
                    "max_annotation_message_length",
                    config.github.max_annotation_message_length
                )

            # Store settings
            if "store" in data:
                store = data["store"]
                config.store.stale_job_ttl_seconds = store.get(
                    "stale_job_ttl_seconds", config.store.stale_job_ttl_seconds
                )

            # Severity mapping
            if "severity_mapping" in data:
                sm = data["severity_mapping"]
                config.severity_mapping.high = sm.get("high", config.severity_mapping.high)
                config.severity_mapping.medium = sm.get("medium", config.severity_mapping.medium)
                config.severity_mapping.low = sm.get("low", config.severity_mapping.low)

            # Feature flags
            if "features" in data:
                features = data["features"]
                config.features.post_comments = features.get(
                    "post_comments", config.features.post_comments
                )
                config.features.post_check_runs = features.get(
                    "post_check_runs", config.features.post_check_runs
                )

        except Exception as e:
            # Log warning but don't fail - use defaults
            import logging
            logging.warning(f"Failed to load config from {path}: {e}")

        return config

    def validate(self) -> None:
        """Validate that required configuration is present."""
        errors = []

        if not self.github.token:
            errors.append("GITHUB_TOKEN is required")

        if not self.security.docs_agent_secret:
            errors.append("DOCS_AGENT_SECRET is required")

        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")


# Global config instance (lazy loaded)
_config: Optional[ReleaseReviewConfig] = None


def get_config() -> ReleaseReviewConfig:
    """Get the global configuration instance."""
    global _config
    if _config is None:
        _config = ReleaseReviewConfig.from_env()
    return _config


def reset_config() -> None:
    """Reset the global configuration (useful for testing)."""
    global _config
    _config = None
