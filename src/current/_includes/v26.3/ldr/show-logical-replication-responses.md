Field    | Response
---------+----------
`job_id` | The job's ID. Use with [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}), [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}), [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}), [`SHOW JOB`]({% link {{ page.version.version }}/show-jobs.md %}).
`status` | The job's current state. Possible values: `pending`, `paused`, `pause-requested`, `failed`, `succeeded`, `canceled`, `cancel-requested`, `running`, `retry-running`, `retry-reverting`, `reverting`, `revert-failed`.<br><br>Refer to [Jobs status]({% link {{ page.version.version }}/show-jobs.md %}#job-status) for a description of each status.
`tables` | The fully qualified name of the table(s) that are part of the LDR job.
`replicated_time` | The latest [timestamp]({% link {{ page.version.version }}/timestamp.md %}) at which the destination cluster has consistent data. This time advances automatically as long as the LDR job proceeds without error. `replicated_time` is updated periodically (every 30s).
`replication_start_time` | The start time of the LDR job.
`conflict_resolution_type` | The type of [conflict resolution]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#conflict-resolution): `LWW` last write wins.
`command` | Description of the job including the replicating table(s) and the cluster connections.
