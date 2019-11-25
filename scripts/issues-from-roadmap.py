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
import re
import requests

parser = argparse.ArgumentParser(
    description = "create docs issues from an Airtable roadmap")
parser.add_argument("--github_access_token",
    default=os.environ.get("GITHUB_ACCESS_TOKEN", None),
    help="""your GitHub personal access token. Store as a GITHUB_ACCESS_TOKEN
            environment variable or pass here.""")
parser.add_argument("--airtable_api_key",
    default=os.environ.get("AIRTABLE_API_KEY", None),
    help="your Airtable developer key. Store as AIRTABLE_API_KEY or pass here")
# parser.add_argument("--airtable_product_area", required=True,
#     help="the Airtable product area to create docs issues for")
parser.add_argument("--milestone", required=True,
    help="milestone to assign to docs issues, e.g., 20.1, 20.2, etc.")
args = parser.parse_args()

airtable_records = 0
github_issues_created = 0

# Get list of docs-relevant airtable epics for 20.1.
offset = ""
while True:
    # filter_formula = "AND({Product Area} = " + args.airtable_product_area + ")"
    # url = "https://api.airtable.com/v0/apppcLIR8IFy1QDcA/Epics%2FFeatures?view=20.1%20Docs%20view&filterByFormula=" + filter_formula + "&api_key=" + args.airtable_api_key
    url = "https://api.airtable.com/v0/apppcLIR8IFy1QDcA/Epics%2FFeatures?view=20.1%20Docs%20view&offset=" + offset + "&api_key=" + args.airtable_api_key
    req = requests.get(url)
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
                epic_members = ""
                members = fields[key]
                for member in members:
                    name = member.get("name")
                    epic_members = epic_members + name + ", "
                epic_members = epic_members.rstrip(", ")
        # print("Background: https://airtable.com/tblD3oZPLJgGhCmch/viw1DKmbKhg2MIECH/" + epic_id + "\n\nEpic: " + epic_name + "\n\nDescription: " + epic_desc + "\n\nTeam: " + str(epic_members))
        # print("\n\n")

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
        url = "https://api.github.com/repos/cockroachdb/docs/issues"
        headers = {"Authorization": "token " + args.github_access_token}
        req = requests.post(url, headers=headers, data=json.dumps(issue))
        if req.status_code == 201:
            print("Successfully created issue {0:s}".format(epic_name), "\n")
            print(issue, "\n")
            github_issues_created += 1
        else:
            print("Could not create issue {0:s}".format(epic_name), "\n")
            print("Response:", req.content, "\n")

    try:
        offset = resp["offset"]
    except:
        break

print("Airtable records:", airtable_records)
print("Docs issues created:", github_issues_created)
