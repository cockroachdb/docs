#!/usr/bin/env python3

"""Create docs issues from a release notes file.

Before running, add {% comment %}doc{% endcomment %} to the end of each bullet
in the release notes file that needs a docs issue.

Help: python3 issues-from-release-notes.py --help
Example use: python3 issues-from-release-notes.py --release_notes=v2.0.1.md --milestone=2.0.x

Requirements:
  - Requests: http://docs.python-requests.org/en/master/
  - A GitHub personal access token. This is required for POSTing due to 2-factor auth.
    Store your token as a GITHUB_ACCESS_TOKEN environment variable.
"""

import argparse
import json
import os
import re
import requests

parser = argparse.ArgumentParser(
    description = "create docs issues from a release notes file")
parser.add_argument("-r", "--release_notes", required=True,
    help="release notes file from which to create docs issues")
parser.add_argument("-m", "--milestone", required=True,
    help="milestone to assign to docs issues, e.g., 19.2, 19.1, 2.1.x")

args = parser.parse_args()

release_notes = args.release_notes
milestone = args.milestone

# Map milestones to their internal IDs.
if milestone == "20.2":
    milestone = 18
if milestone == "20.1":
    milestone = 17
if milestone == "19.2.x":
    milestone = 20
if milestone == "19.2":
    milestone = 14
if milestone == "19.1":
    milestone = 15
if milestone == "19.1.x":
    milestone = 16
if milestone == "2.1.x":
    milestone = 12
if milestone == "2.1":
    milestone = 8
if milestone == "2.0.x":
    milestone = 10

bullets_with_comments = 0
issues_created = 0
rebullet = re.compile(r"^\s*-")

with open("../releases/" + release_notes) as file:
    for line in file:
        # Find release note bullets for which we need docs issues.
        if rebullet.search(line) and line.endswith("{% endcomment %}\n"):
            bullets_with_comments += 1

            # For each bullet, get the title of the corresponding PR
            # from the cockroach repository.
            try:
                pr_num = line[line.rfind("[")+2:line.rfind("]")]
                url = "https://api.github.com/repos/cockroachdb/cockroach/pulls/" + str(pr_num)
                req = requests.get(url)
                resp = req.json()
                title = resp["title"]
            except Exception as e:
                print("Exception:", e, "\n")
                continue

            # For each bullet, create an issue in the docs repository.
            try:
                issue = {"title": title,
                         "body": "PR: https://github.com/cockroachdb/cockroach/pull/" + str(pr_num) + "\n\n" + "From release notes:\n> " + line[line.find("-")+2:-1],
                         "labels": ["C-release-note"],
                         "milestone": milestone}
                url = "https://api.github.com/repos/cockroachdb/docs/issues"
                access_token = os.getenv("GITHUB_ACCESS_TOKEN")
                headers = {"Authorization": "token " + access_token}
                req = requests.post(url, headers=headers, data=json.dumps(issue))
                if req.status_code == 201:
                    print("Successfully created issue {0:s}".format(title), "\n")
                    print(issue, "\n")
                    issues_created += 1
                else:
                    print("Could not create issue {0:s}".format(title), "\n")
                    print("Response:", req.content, "\n")
            except Exception as e:
                print("Exception:", e, "\n")
                continue

print("Bullets with doc comments:", bullets_with_comments)
print("Docs issues created:", issues_created)
