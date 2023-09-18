The following is a list of available metrics for use in the Custom Metrics Chart page.

### Changefeed 

Name | Description
-----|-----
`changefeed.running` | Number of currently running changefeeds, including sinkless
`changefeed.failures` | Total number of `changefeed` jobs which have failed
`changefeed.error_retries` | Total retryable errors encountered by all changefeeds
`changefeed.emitted_messages` | Messages emitted by all feeds
`changefeed.emitted_bytes` | Bytes emitted by all feeds
`changefeed.commit_latency` | Event commit latency: a difference between event MVCC timestamp and the time it was acknowledged by the downstream sink.  If the sink batches events,  then the difference between the earliest event in the batch and acknowledgement is recorded; Excludes latency during backfill
`jobs.changefeed.currently_paused` | Number of `changefeed` jobs currently considered Paused
`jobs.changefeed.protected_age_sec` | The age of the oldest PTS record protected by `changefeed` jobs.

### Row-Level TTL

Name | Description
-----|-----
`jobs.row_level_ttl.resume_completed` | Number of `row_level_ttl` jobs which successfully resumed to completion
`jobs.row_level_ttl.resume_failed` | Number of `row_level_ttl` jobs which failed with a non-retryable error
`jobs_row_level_ttl.rows_selected` | Number of rows selected for deletion by the row level TTL job.
`jobs.row_level_ttl.rows_deleted` | Number of rows deleted by the row level TTL job.
`jobs.row_level_ttl.currently_paused` | Number of `row_level_ttl` jobs currently considered Paused
`jobs.row_level_ttl.currently_running` | Number of `row_level_ttl` jobs currently running
`schedules.scheduled-row-level-ttl-executor.failed` | Number of `scheduled-row-level-ttl-executor` jobs failed

### Table Statistics 

Name | Description
-----|-----
`jobs.auto_create_stats.resume_failed` | Number of `auto_create_stats` jobs which failed with a non-retryable error
`jobs.auto_create_stats.currently_running` | Number of `auto_create_stats` jobs currently running
`jobs.auto_create_stats.currently_paused` | Number of `auto_create_stats` jobs currently considered Paused
`jobs.create_stats.currently_running` | Number of `create_stats` jobs currently running
