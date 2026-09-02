#!/usr/bin/env python3
"""
Standalone runner for the release notes AI reviewer.
Invoked from the GitHub Action workflow.
"""
import os
import sys
import logging

sys.path.insert(0, os.path.dirname(__file__))

from release_review.reviewer import ReleaseNotesReviewer
from release_review.reporter import Reporter
from release_review.github_client import GitHubClient
from release_review.config import ReleaseReviewConfig

def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    logger = logging.getLogger(__name__)

    repo = os.environ["GITHUB_REPOSITORY"]
    pr_number = int(os.environ["PR_NUMBER"])
    commit_sha = os.environ["COMMIT_SHA"]

    config = ReleaseReviewConfig.from_env()
    reviewer = ReleaseNotesReviewer()
    reporter = Reporter()
    github = GitHubClient()

    logger.info(f"Reviewing PR #{pr_number} in {repo}")
    result = reviewer.review_pr(repo, pr_number, commit_sha)
    payload = reviewer.create_review_payload(repo, pr_number, commit_sha, result)

    if config.features.post_check_runs:
        check_output = reporter.build_check_output(payload)
        check_run_id = github.create_check_run(repo, commit_sha, check_output)
        logger.info(f"Created check run: {check_run_id}")

    if config.features.post_comments:
        comment_body = reporter.build_comment_body(payload)
        comment_id = github.create_or_update_comment(repo, pr_number, comment_body)
        logger.info(f"Posted comment: {comment_id}")

    logger.info(f"Review complete: {result.summary}")

if __name__ == "__main__":
    main()
