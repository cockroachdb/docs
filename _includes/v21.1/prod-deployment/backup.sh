#!/bin/bash

set -euo pipefail

# This script creates full backups when run on the configured
# day of the week and incremental backups when run on other days, and tracks
# recently created backups in a file to pass as the base for incremental backups.

what=""                                           # Leave empty for cluster backup, or add "DATABASE database_name" to backup a database.
base="<storage_URL>/backups"                      # The URL where you want to store the backup.
extra="<storage_parameters>"                      # Any additional parameters that need to be appended to the BACKUP URI e.g. AWS key params.
recent=recent_backups.txt                         # File in which recent backups are tracked.
backup_parameters=<additional backup parameters>  # e.g. "WITH revision_history"

# Customize the `cockroach sql` command with `--host`, `--certs-dir` or `--insecure`, `--port`, and additional flags as needed to connect to the SQL client.
runsql() { cockroach sql --insecure -e "$1"; }

destination="${base}/$(date +"%Y-%V")${extra}" # %V is the week number of the year, with Monday as the first day of the week.

runsql "BACKUP $what TO '$destination' AS OF SYSTEM TIME '-1m' $backup_parameters"
echo "backed up to ${destination}"
