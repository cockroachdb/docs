#!/usr/bin/env bash
# Run from within an unzipped debug.zip directory.
set -euo pipefail

# Check if ripgrep is installed.
if ! command -v rg &> /dev/null; then
  echo "Error: ripgrep is not installed. Please install following the instructions in https://github.com/BurntSushi/ripgrep#installation"
  exit 1
fi

# Check if duckdb is installed.
if ! command -v duckdb &> /dev/null; then
  echo "Error: duckdb is not installed. Please install following the instructions in https://duckdb.org/docs/installation"
  exit 1
fi

# Grep the debug.zip for the two queries.
echo "Searching for liveness epoch increments ..."
echo "timestamp,remote_node_id,epoch" > logs_epoch_increment.csv
rg -I -r '$1,$2,$3' 'I([0-9]+ [0-9:.]+).*incremented n(.*) liveness epoch to (.*)' nodes >> logs_epoch_increment.csv || true
if [[ $(wc -l <logs_epoch_increment.csv) -eq 1 ]]; then
    printf "\n✅ No liveness epoch increments found. Symptoms not detected.\n"
    exit 0
fi

echo "Searching for slow lease promotions ..."
echo "timestamp,node_id,range_id,range_span,lease_epoch,lease_proposed,prev_expiration" > logs_slow_lease_promo.csv
rg -I -r '$1,$2,$3,$4,$5,$6,$7' 'W([0-9]+ [0-9:.]+).*,n(\d+),.*,r(\d+)/\d+:(.*),raft\].*client traffic may have been delayed.*epo=(\d+).*pro=(\d+\.\d+).*prev.*exp=(\d+\.\d+).*Request.*' nodes >> logs_slow_lease_promo.csv || true
if [[ $(wc -l <logs_slow_lease_promo.csv) -eq 1 ]]; then
    printf "\n✅ No slow lease promotions found. Symptoms not detected.\n"
    exit 0
fi

# Query the logs using duckdb.
echo "Querying the logs for lease expiration regressions ..."
cat <<EOF > query.sql
SELECT
  'node '
  || node_id
  || ' observed possible symptoms at '
  || lease_proposed_min
  || ' on ranges '
  || string_agg(range_id, ', ') as symptoms
FROM
  (
    WITH
      lease_acqs AS (
        SELECT
          strptime(timestamp, '%y%m%d %H:%M:%S.%n')::timestamp_ns as timestamp,
          node_id,
          range_id,
          range_span,
          lease_epoch,
          timezone('UTC', to_timestamp(lease_proposed)) AS lease_proposed,
          timezone('UTC', to_timestamp(prev_expiration)) AS prev_expiration
        FROM 'logs_slow_lease_promo.csv'
      ),
      epoch_incs AS (
        SELECT
          strptime(timestamp, '%y%m%d %H:%M:%S.%n')::timestamp_ns as timestamp,
          remote_node_id,
          epoch
        FROM 'logs_epoch_increment.csv'
      )
    SELECT *, date_trunc('minute', lease_proposed) AS lease_proposed_min
    FROM lease_acqs JOIN epoch_incs
    -- where the leaseholder's liveness record had its epoch incremented
    ON lease_acqs.node_id = epoch_incs.remote_node_id
    -- and the lease acquisition used an epoch that is less than the one
    -- that was incremented to
    AND lease_acqs.lease_epoch < epoch_incs.epoch
    -- and the lease acquisition began before the epoch increment
    AND lease_acqs.lease_proposed < epoch_incs.timestamp
    -- and the lease acquisition completed after the epoch increment
    AND lease_acqs.timestamp > epoch_incs.timestamp
    -- and the previous lease's expiration was after the epoch increment
    AND lease_acqs.prev_expiration > epoch_incs.timestamp
  )
GROUP BY node_id, lease_proposed_min
ORDER BY lease_proposed_min
EOF
duckdb -list < query.sql > logs_lease_regressions.txt

# Output result.
if [ -s logs_lease_regressions.txt ]; then
    printf "\n❌ Lease expiration regressions found. Symptoms detected.\n\n"
    cat logs_lease_regressions.txt
    exit 1
else
    printf "\n✅ No lease expiration regressions found. Symptoms not detected.\n"
    exit 0
fi
