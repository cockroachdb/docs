import json
import sys

"""
Run via `azure location list --json | python scripts/azure-locations.py > _includes/azure-locations.md`
You may have to first log in to Azure via the `azure login` command.
"""

print "|  Location | SQL Statement |"
print "|  -------- | ------------- |"
data = json.load(sys.stdin)
for location in data:
    print "|  %s (%s) | `INSERT into system.locations VALUES ('region', '%s', %s, %s)` |" % (location['name'], location['displayName'], location['name'], location['latitude'], location['longitude'])
