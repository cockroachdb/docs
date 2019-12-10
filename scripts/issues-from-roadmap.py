"""Create docs issues from an Airtable roadmap.

Help: python3 issues-from-roadmap.py --help
Example use: python3 issues-from-roadmap.py --milestone=20.1

Requirements:
  - Requests: http://docs.python-requests.org/en/master/
  - ratelimiter: https://pypi.org/project/ratelimiter/
  - A GitHub personal access token.
  - An Airtable developer key.
"""

import argparse
import json
import os
import requests
from ratelimiter import RateLimiter

# Map Airtable product areas to GitHub labels and writers.
epic_area_to_tag_and_writer = {
    "KV": ("A-kv-storage", "rmloveland"),
    "SQL": ("A-sql", "ericharmeling"),
    "Observability": ("A-observability", "taroface"),
    "IAM & Security": ("A-iam-security", "Amruta-Ranade"),
    "Bulk I/O": ("A-io", "lnhsingh"),
    "I/O": ("A-io", "lnhsingh"),
    "CockroachCloud - Platform": ("A-cloud", "Amruta-Ranade"),
}

parser = argparse.ArgumentParser(
    description = "create docs issues from an Airtable roadmap")
parser.add_argument("--github_access_token",
    default=os.environ.get("GITHUB_ACCESS_TOKEN", None),
    help="""your GitHub personal access token. Store as a GITHUB_ACCESS_TOKEN
            environment variable or pass here.""")
parser.add_argument("--airtable_api_key",
    default=os.environ.get("AIRTABLE_API_KEY", None),
    help="your Airtable developer key. Store as AIRTABLE_API_KEY or pass here")
parser.add_argument("-m", "--milestone", required=True,
    help="milestone to assign to docs issues, e.g., 20.1, 20.2, etc.")
parser.add_argument(
    "--check_existing",
    default=False,
    help="""If on, checks if the issue exists, searches and attempts to update the GitHub issue if it exists.""",
    action='store_true',
)
parser.add_argument(
    "--dry_run",
    default=False,
    help="""If on, runs logic but makes no updates to GitHub""",
    action='store_true',
)
args = parser.parse_args()

airtable_records = 0
github_issues_created = 0
github_issues_updated = 0

# create_issue creates a new issue on GitHub.
def create_issue(issue):
    global github_issues_created

    url = "https://api.github.com/repos/cockroachdb/docs/issues"
    headers = {"Authorization": "token " + args.github_access_token}
    resp = requests.post(url, headers=headers, data=json.dumps(issue))
    if resp.status_code == 201:
        ret = resp.json()
        print("Successfully created issue {0:s} #{}".format(epic_name, ret['number']), "\n")
        print(issue, "\n")
        github_issues_created += 1
        return resp.json()
    print("Could not create issue {0:s}".format(epic_name), "\n")
    print("Response:", req.content, "\n")
    return []

# search_issue attempts to search for an existing issue on GitHub.
# GitHub has a rate limiter of 30 searches every minute.
# Spread this out a little over the minute by allowing 1 call every 2 secs.
@RateLimiter(max_calls=1, period=2)
def search_issue(issue):
    url = "https://api.github.com/search/issues"
    headers = {"Authorization": "token " + args.github_access_token}
    resp = requests.get(
        url,
        headers=headers,
        params={
            "q": issue["title"].replace(' ', '+') + '+milestone:"{}"+label:"C-roadmap"+state:"open"+repo:cockroachdb/docs'.format(args.milestone),
        },
    )
    assert resp.ok, resp
    return resp.json()['items']

# update_issue updates the issue on GitHub. It overrides the existing entry.
def update_issue(issue_to_update, new_params):
    global github_issues_updated

    url = "https://api.github.com/repos/cockroachdb/docs/issues/{}".format(
        issue_to_update['number'],
    )
    headers = {"Authorization": "token " + args.github_access_token}
    resp = requests.patch(
        url,
        headers=headers,
        json=new_params,
    )
    assert resp.ok, resp
    print('Successfully updated issue #{}'.format(issue_to_update['number']))
    github_issues_updated += 1
    return resp.json()

# Get list of docs-relevant airtable epics for 20.1.
offset = ""
has_more = True
while has_more:
    url = "https://api.airtable.com/v0/apppcLIR8IFy1QDcA/Epics"
    headers = {"Authorization": "Bearer " + args.airtable_api_key}
    params = {"view": "20.1 Docs view", "pageSize": "5", "offset": offset}
    req = requests.get(url, headers=headers, params=params)
    resp = req.json()
    records = resp["records"]
    airtable_records = airtable_records + len(records)
    for r in records:
        epic_id = r.get("id")
        fields = r.get("fields")
        assert fields, "missing fields in airtable entry"
        epic_name = fields.get("Epic/Feature Name", "")
        epic_desc = fields.get("Describe this feature to the customer", "")
        epic_area = fields.get("Product Area", "")
        epic_members = ", ".join(member['name'] for member in fields.get("Team Members", []))
        github_tracking_issue = fields.get("Github Tracking Issue", "")

        assert epic_area in epic_area_to_tag_and_writer, "could not found tag and writer for {}".format(epic_area)
        epic_area_tag, writer = epic_area_to_tag_and_writer[epic_area]

        # Map GitHub milestones to their internal IDs.
        if args.milestone == "20.2":
            milestone = 18
        if args.milestone == "20.1":
            milestone = 17

        # For each epic, create an issue in the docs repository.
        issue = {
            "title": epic_name,
            "body": (
                "Background: https://airtable.com/tblD3oZPLJgGhCmch/viw1DKmbKhg2MIECH/" + epic_id +
                "\n\nDescription: " + epic_desc +
                "\n\nTeam: " + epic_members +
                "\n\nGithub Tracking Issue: " + github_tracking_issue),
            "labels": ["C-roadmap", epic_area_tag],
            "milestone": milestone,
            "assignee": writer,
        }
        found_issues = [] if not args.check_existing else search_issue(issue)

        # If issue is not found, create it.
        # This is the default path if `args.check_existing` is False.
        if not found_issues:
            if args.dry_run:
                print("skipping issue creation due to dry run")
                continue
            create_issue(issue)
            continue

        # Otherwise, update each issue. For now, assert there to only be one.
        assert len(found_issues) == 1, (
            "found multiple issues from search: " +
            ','.join(['#' + iss['number'] for iss in found_issues])
        )

        for found_issue in found_issues:
            if args.dry_run:
                print("skipping issue update (#{}) due to dry run".format(found_issue['number']))
                continue
            update_issue(found_issue, issue)

    if "offset" in resp:
        offset = resp["offset"]
    else:
        has_more = False

print("Airtable records:", airtable_records)
print("Docs issues created:", github_issues_created)
print("Docs issues updated:", github_issues_updated)
