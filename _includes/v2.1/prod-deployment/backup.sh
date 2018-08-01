#!/bin/bash

set -euo pipefail

# this script runs backups, creating full backups when run on the configured
# day of the week and incremental backups when run on other days, and tracks
# recently created backups in a file to pass as the base for INCREMENTAL option.

full_day=<day_of_the_week>                 # Must match (including case) the output of `LC_ALL=C date +%A`.
what="DATABASE <database_name>"            # what to backup.
base="<storage_URL>/backups"   # base dir in which to create backups.
extra="<storage_parameters>"                        # any additional parameters that need to be appended to the BACKUP URI e.g. AWS key params.
recent=recent_backups.txt              # file in which recent backups are recorded.
backup_parameters=                        # e.g. "WITH revision_history"

# customize with additional flags for certificates/hosts/etc as needed to connect.
runsql() { cockroach sql --insecure -e "$1"; }

destination="${base}/$(date +"%Y%m%d-%H%M")${extra}"

prev=
while read -r line; do
    [[ "$prev" ]] && prev+=", "
    prev+="'$line'"
done < "$recent"

if [[ "$(LC_ALL=C date +%A)" = "$full_day" || ! "$prev" ]]; then
    runsql "BACKUP $what TO '$destination' AS OF SYSTEM TIME '-1m' $backup_parameters"
    echo "$destination" > "$recent"
else
    destination="${base}/$(date +"%Y%m%d-%H%M")-inc${extra}"
    runsql "BACKUP $what TO '$destination' AS OF SYSTEM TIME '-1m' INCREMENTAL FROM $prev $backup_parameters"
    echo "$destination" >> "$recent"
fi

echo "backed up to ${destination}"
