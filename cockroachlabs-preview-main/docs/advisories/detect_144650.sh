#!/bin/bash

# Run from within an unzipped debug.zip directory.
set -euo pipefail

if [ -n "$1" ]; then
  TARGET_DIR="$1"
  cd "$TARGET_DIR"
fi

OUT="out_144650"
rm -rf $OUT
mkdir $OUT


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

# Grep for async flush errors not in backfill jobs
echo "Searching for silent async flush errors"
rg "closing with flushes in-progress encountered an error: addsstable" | rg -v "indexBackfillerProcessor" > $OUT/async_flush_errs.txt || true
if [[ $(wc -l <$OUT/async_flush_errs.txt) -eq 0 ]]; then
    printf "\n No async flush errors identified.\n"
    exit 0
fi

rg 'job=0' $OUT/async_flush_errs.txt > $OUT/jobless_errs.txt || true
rg -v 'job=' $OUT/async_flush_errs.txt >> $OUT/jobless_errs.txt || true
jobless_errs_found="false"
if [[ $(wc -l <$OUT/jobless_errs.txt) -ge 1 ]]; then  
  echo "WARNING: detected bad error without job id tag. Cannot check if job succeeded. See jobless_errs.txt. Contact support."
  jobless_errs_found="true"
fi

# In csv: dump the job id, and timestamp of the logged error:
# Example logged error: W250422 06:22:39.852238 6885 kv/bulk/sst_batcher.go:432 ⋮ [T3,Vdemoapp,n1,job=1065722008981340161] 1249  closing with flushes in-progress encountered an error
# Parses to: 250422 06:22:39.85223, 1065722008981340161
echo "timestamp,job_id" > $OUT/flush_err_job_ts.csv
rg -o 'W\d{6} \d{2}:\d{2}:\d{2}\.\d+.*?job=\d+' $OUT/async_flush_errs.txt | sed -E 's/.*W([0-9]{6}) ([0-9:.]+).*job=([0-9]+)/\1 \2,\3/' >> $OUT/flush_err_job_ts.csv || true

# In csv: dump the timestamp of all distsql level retries:
# Example: W250422 06:25:34.137319 25390 sql/importer/import_job.go ⋮ [T3,Vdemoapp,n1,job=1065722008981340161] encountered      retryable error: grpc: ‹×› [code 2/Unknown]
# Parses to: 250422 06:25:34.137319, 1065722008981340161 
echo "timestamp,job_id" > $OUT/distsql_retry.csv
rg "encountered retryable error" | rg "import" > $OUT/distsql_retry.txt || true
rg -o 'W\d{6} \d{2}:\d{2}:\d{2}\.\d+.*?job=\d+' $OUT/distsql_retry.txt | sed -E 's/.*W([0-9]{6}) ([0-9:.]+).*job=([0-9]+)/\1 \2,\3/' >> $OUT/distsql_retry.csv || true

# In csv: dump the timestamp of all job level retries
# Example: I250422 06:25:34.137319 25390 jobs/adopt.go ⋮ [T3,Vdemoapp,n1] job 1065722008981340161: resuming execution
# Parses to: 250422 06:25:34.137319, 1065722008981340161 
echo "timestamp,job_id" > $OUT/job_retry.csv
rg "resuming execution" | rg "adopt.go" > $OUT/job_retry.txt || true
rg -o 'I\d{6} \d{2}:\d{2}:\d{2}\.\d+.*?job \d+' $OUT/job_retry.txt | sed -E 's/.*I([0-9]{6}) ([0-9:.]+).*job ([0-9]+)/\1 \2,\3/' >> $OUT/job_retry.csv || true

# In CSV: dump all the completed job ids:
echo "Searching for succeeded jobs"
rg -o 'job \d+: stepping through state succeeded' | cut -d':' -f2- > $OUT/completed_jobs_raw.txt

echo "job_id" > $OUT/completed_jobs.csv
rg -o '\d+' $OUT/completed_jobs_raw.txt >> $OUT/completed_jobs.csv || true

# In CSV, dump all jobs with num rows
echo "Find NumRows for all successful jobs"
rg 'NumRows' | rg 'JobID' | rg 'succeeded' > $OUT/completed_jobs_num_rows.txt || true

echo "job_id,num_rows" > $OUT/job_num_rows.csv
rg 'recovery_event' $OUT/completed_jobs_num_rows.txt | sed -n 's/.*"JobID":\([0-9]*\).*"NumRows":\([0-9]*\).*/\1,\2/p' >> $OUT/job_num_rows.csv || true

# Find all jobs where the async err was after the latest distsql or job retry
cd $OUT
cat <<EOF > step1.sql
COPY (
  WITH flush_max AS (
    SELECT job_id, MAX(timestamp) AS max_flush_ts
    FROM read_csv('flush_err_job_ts.csv', AUTO_DETECT=TRUE)
    GROUP BY job_id
  ),
  retry_max AS (
    SELECT job_id, MAX(timestamp) AS max_retry_ts
    FROM (
      SELECT * FROM read_csv('distsql_retry.csv', AUTO_DETECT=TRUE)
      UNION ALL
      SELECT * FROM read_csv('job_retry.csv', AUTO_DETECT=TRUE)
    )
    GROUP BY job_id
  )
  SELECT f.job_id
  FROM flush_max f
  LEFT JOIN retry_max r ON f.job_id = r.job_id
  WHERE r.max_retry_ts IS NULL OR f.max_flush_ts > r.max_retry_ts
) TO 'jobs_with_late_flush.csv' (HEADER);
EOF

duckdb -batch < step1.sql

# Find all successful jobs with the canary log line after any retries
cat <<EOF > query.sql
SELECT DISTINCT f.job_id, n.num_rows
FROM 'jobs_with_late_flush.csv' f
JOIN 'completed_jobs.csv' c ON f.job_id = c.job_id
LEFT JOIN 'job_num_rows.csv' n ON f.job_id = n.job_id;
EOF
duckdb -table < query.sql > corrupt_jobs.txt

if [ -s corrupt_jobs.txt ]; then
    printf "\n Potentially Corrupt Jobs found. Contact Support. \n\n"
    cat corrupt_jobs.txt
    exit 1
elif [[ "$jobless_errs_found" == "true" ]]; then
    exit 1
else
    echo " Symptoms not detected on tagged jobs."
    exit 0
fi