1. Check the output to observe `replicator` progress.

	A `starting replicator` message indicates that the task has started:

	~~~ json
	{"level":"info","time":"2025-02-10T14:28:13-05:00","message":"starting replicator"}
	~~~

	The `staging database name` message contains the name of the staging schema: 

	~~~ json
	{"level":"info","time":"2025-02-10T14:28:13-05:00","message":"staging database name: _replicator_1739215693817700000"}
	~~~

	The staging schema provides a replication marker for streaming changes. You will need the staging schema name in case replication fails and must be [resumed]({% link molt/molt-fetch.md %}#resume-replication), or [failback to the source database]({% link molt/migrate-failback.md %}) is performed.

	`upserted rows` log messages indicate that changes were replicated to CockroachDB:

	~~~ shell
	DEBUG  [Jan 22 13:52:40] upserted rows                                 conflicts=0 duration=7.620208ms proposed=1 target="\"molt\".\"public\".\"employees\"" upserted=1
	~~~