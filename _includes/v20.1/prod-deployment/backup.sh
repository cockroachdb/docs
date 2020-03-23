#!/bin/bash

set -euo pipefail

# This script creates full backups when run on the configured
# day of the week and incremental backups when run on other days, and tracks
# recently created backups in a file to pass as the base for incremental backups.

full_day="<day_of_the_week>"                      # Must match (including case) the output of `LC_ALL=C date +%A`.
what=""                                           # Leave empty for full cluster backup, or add "DATABASE database_name" to backup a database.
base="<storage_URL>/backups"                      # The URL where you want to store the backup.
extra="<storage_parameters>"                      # Any additional parameters that need to be appended to the BACKUP URI e.g. AWS key params.
recent=recent_backups.txt                         # File in which recent backups are tracked.
backup_parameters=<additional backup parameters>  # e.g. "WITH revision_history"

# Customize the `cockroach sql` command with `--host`, `--certs-dir` or `--insecure`, `--port`, and additional flags as needed to connect to the SQL client.
runsql() { cockroach sql --insecure -e "$1"; }

destination="${base}/$(date +"%Y%m%d-%H%M")${extra}"

current=$(tail -1 "$recent")

runsql "BACKUP $what TO '$destination' AS OF SYSTEM TIME '-1m' $backup_parameters"
echo "$destination" > "$recent"

echo "backed up to ${destination}"
