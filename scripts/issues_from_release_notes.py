#!/usr/bin/env python3

"""Create docs issues from a release notes file.

Before running, add {% comment %}doc{% endcomment %} to the end of each bullet
in the release notes file that needs a docs issue.

Help: python3 issues-from-release-notes.py --help
Example use: python3 issues-from-release-notes.py --release_notes=v2.0.1.md --milestone=2.0.x

Requirements:
  - Requests: http://docs.python-requests.org/en/master/
  - A GitHub personal access token.
"""

import argparse
import json
import os
import re
import requests

parser = argparse.ArgumentParser(
    description = "create docs issues from a release notes file")
parser.add_argument("--github_access_token",
    default=os.environ.get("GITHUB_ACCESS_TOKEN", None),
    help="""your GitHub personal access token. Store as a GITHUB_ACCESS_TOKEN
            environment variable or pass here.""")
parser.add_argument("-m", "--milestone", required=True,
    help="milestone to assign to docs issues, e.g., 20.1, 20.2, etc.")
parser.add_argument("-r", "--release_notes", required=True,
    help="release notes file from which to create docs issues")

args = parser.parse_args()
release_notes = args.release_notes
milestone = args.milestone

# Map milestones to their internal IDs.
if milestone == "22.2"
    milestone = 26
if milestone == "22.1"
    milestone = 25
if milestone == "21.2":
    milestone = 24
if milestone == "21.1":
    milestone = 23
if milestone == "20.2":
    milestone = 18
if milestone == "20.1":
    milestone = 17

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
                headers = {"Authorization": "token " + args.github_access_token}
                req = requests.get(url, headers=headers)
                resp = req.json()
                title = resp["title"]
            except Exception as e:
                print("Exception:", e, "\n")
                continue

            # For each bullet, create an issue in the docs repository.
            try:
                issue = {"title": title,
                         "body": "PR: https://github.com/cockroachdb/cockroach/pull/" + str(pr_num) + "\n\n" + "From release notes:\n> " + line[line.find("-")+2:-1],
                         "labels": ["C-product-change"],
                         "milestone": milestone}
                url = "https://api.github.com/repos/cockroachdb/docs/issues"
                headers = {"Authorization": "token " + args.github_access_token}
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
