State      | Description
-----------+----------------
`initializing replication` | The replication job is completing the initial scan of data from the primary cluster before it starts replicating data in real time.
`ready` | A virtual cluster's data is ready for use.
`replicating` | The replication job has started and is replicating data.
`replication paused` | The replication job is paused due to an error or a manual request with [`ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}).
`replication pending cutover` | The replication job is running and the cutover time has been set. Once the the replication reaches the cutover time, the cutover will begin automatically.
`replication cutting over` | The job has started cutting over. The cutover time can no longer be changed. Once cutover is complete, A virtual cluster will be available for use with [`ALTER VIRTUAL CLUSTER ... START SERVICE SHARED`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}).
`replication error` | An error has occurred. You can find more detail in the error message and the [logs]({% link {{ page.version.version }}/configure-logs.md %}). **Note:** A PCR job will retry for 3 minutes before failing.
