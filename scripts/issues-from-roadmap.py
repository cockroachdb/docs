"""Create docs issues from an Airtable roadmap.

Help: python3 issues-from-roadmap.py --help
Example use: python3 issues-from-roadmap.py --milestone=20.1

Requirements:
  - Requests: http://docs.python-requests.org/en/master/
  - A GitHub personal access token.
  - An Airtable developer key.
"""

import argparse
import json
import os
import requests
from ratelimiter import RateLimiter

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
    default=True,
    help="""If on, checks if the issue exists, and does not add a Github issue if it does.""",
    action='store_true',
)

parser.add_argument(
    "--dry_run",
    default=False,
    help="""If on, runs logic but makes no updates to github""",
    action='store_true',
)
args = parser.parse_args()

airtable_records = 0
airtable_records_updated = 0
github_issues_created = 0

def create_issue(issue):
    global github_issues_created

    url = "https://api.github.com/repos/cockroachdb/docs/issues"
    headers = {"Authorization": "token " + args.github_access_token}
    req = requests.post(url, headers=headers, data=json.dumps(issue))
    if req.status_code == 201:
        print("Successfully created issue {0:s}".format(epic_name), "\n")
        print(issue, "\n")
        github_issues_created += 1
        return req.json()
    print("Could not create issue {0:s}".format(epic_name), "\n")
    print("Response:", req.content, "\n")
    return []

def search_issue(issue):
    url = "https://api.github.com/search/issues"
    headers = {"Authorization": "token " + args.github_access_token}
    resp = requests.get(
        url,
        headers=headers,
        params={
            "q": issue["title"].replace(' ', '+') + '+milestone:"{}"+label:"C-roadmap"+state:"open"+repo:cockroachdb/docs'.format(args.milestone),
        },
    ).json()
    assert 'items' in resp, resp
    return resp['items']

@RateLimiter(max_calls=20, period=60)
def update_airtable_record(record, found_issues):
    global airtable_records_updated

    field_name = 'Github Tracking Issue'
    tracking_field = ''
    if field_name in record['fields']:
        tracking_field = record['fields'][field_name] or ''
    start_tracking_field = tracking_field
    for issue in found_issues:
        html_issue_url = issue['html_url']
        # Do not re-add the issue if it is already there.
        if html_issue_url in tracking_field:
            continue
        # Append extra space if needbe.
        if tracking_field and tracking_field[-1] != " ":
            tracking_field += " "
        tracking_field += html_issue_url
    if start_tracking_field == tracking_field:
        print('tracking field for airtable does not change, return')
        return
    assert len(found_issues) == 1, "removable, just curious if you want this"

    # Prepare record for update and send patch.
    record['fields'][field_name] = tracking_field
    del record['fields']['Feature ID']
    if args.dry_run:
        print('skipping airtable update due to dry run')
        return
    resp = requests.patch(
        "https://api.airtable.com/v0/apppcLIR8IFy1QDcA/Epics",
        headers={"Authorization": "Bearer " + args.airtable_api_key},
        json={'records': [{'id': record['id'], 'fields': record['fields']}]},
    )
    assert resp.ok

    airtable_records_updated += 1

# Get list of docs-relevant airtable epics for 20.1.
offset = ""
while True:
    url = "https://api.airtable.com/v0/apppcLIR8IFy1QDcA/Epics"
    headers = {"Authorization": "Bearer " + args.airtable_api_key}
    params = {"view": "20.1 Docs view", "pageSize": "5", "offset": offset}
    req = requests.get(url, headers=headers, params=params)
    resp = req.json()
    records = resp["records"]
    airtable_records = airtable_records + len(records)
    for r in records:
        epic_id = r.get("id")
        epic_name = ""
        epic_desc = ""
        epic_area = ""
        epic_members = ""
        fields = r.get("fields")
        for key in fields:
            if key == "Epic/Feature Name":
                epic_name = fields[key]
            if key == "Describe this feature to the customer":
                epic_desc = fields[key]
            if key == "Product Area":
                epic_area = fields[key]
            if key == "Team Members":
                members = fields[key]
                for member in members:
                    name = member.get("name")
                    epic_members = epic_members + name + ", "
                epic_members = epic_members.rstrip(", ")
        # print("Background: https://airtable.com/tblD3oZPLJgGhCmch/viw1DKmbKhg2MIECH/" + epic_id + "\n\nEpic: " + epic_name + "\n\nDescription: " + epic_desc + "\n\nTeam: " + str(epic_members))

        # Map Airtable product areas to GitHub labels and writers.
        if epic_area == "KV":
            epic_area = "A-kv-storage"
            writer = "rmloveland"
        if epic_area == "SQL":
            epic_area = "A-sql"
            writer = "ericharmeling"
        if epic_area == "Observability":
            epic_area = "A-observability"
            writer = "taroface"
        if epic_area == "IAM & Security":
            epic_area = "A-iam-security"
            writer = "Amruta-Ranade"
        if epic_area == "Bulk I/O":
            epic_area = "A-io"
            writer = "lnhsingh"
        if epic_area == "CockroachCloud - Platform":
            epic_area = "A-cloud"
            writer = "Amruta-Ranade"

        # Map GitHub milestones to their internal IDs.
        if args.milestone == "20.2":
            milestone = 18
        if args.milestone == "20.1":
            milestone = 17

        # For each epic, create an issue in the docs repository.
        issue = {"title": epic_name,
                 "body": "Background: https://airtable.com/tblD3oZPLJgGhCmch/viw1DKmbKhg2MIECH/" + epic_id + "\n\nDescription: " + epic_desc + "\n\nTeam: " + epic_members,
                 "labels": ["C-roadmap", epic_area],
                 "milestone": milestone,
                 "assignee": writer}
        found_issues = [] if not args.check_existing else search_issue(issue)

        # If issue is not found, create it.
        if not found_issues:
            if args.dry_run:
                print("skipping issue creation due to dry run")
                continue
            created_issues = create_issue(issue)
            update_airtable_record(r, created_issues)
            continue

        # Update airtable record.
        update_airtable_record(r, found_issues)
    try:
        offset = resp["offset"]
    except:
        break

print("Airtable records:", airtable_records)
print("Airtable records:", airtable_records_updated)
print("Docs issues created:", github_issues_created)
