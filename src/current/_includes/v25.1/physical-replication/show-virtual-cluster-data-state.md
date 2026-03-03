State      | Description
-----------+----------------
`add` | ([**Preview**]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#features-in-preview)) The [`readonly` virtual cluster]({% link {{ page.version.version }}/create-virtual-cluster.md %}#start-a-pcr-stream-with-read-from-standby) is waiting for the PCR job's initial scan to complete, then `readonly` will be available for read queries.
`initializing replication` | The replication job is completing the initial scan of data from the primary cluster before it starts replicating data in real time.
`ready` | A virtual cluster's data is ready for use. The `readonly` virtual cluster is ready to serve read queries.
`replicating` | The replication job has started and is replicating data.
`replication paused` | The replication job is paused due to an error or a manual request with [`ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}).
`replication pending failover` | The replication job is running and the failover time has been set. Once the the replication reaches the failover time, the failover will begin automatically.
`replication failing over` | The job has started failing over. The failover time can no longer be changed. Once failover is complete, a virtual cluster will be available for use with [`ALTER VIRTUAL CLUSTER ... START SERVICE SHARED`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}).
`replication error` | An error has occurred. You can find more detail in the error message and the [logs]({% link {{ page.version.version }}/configure-logs.md %}). **Note:** A PCR job will retry for 3 minutes before failing.
