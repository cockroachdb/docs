1. Use [MOLT Verify]({% link molt/molt-verify.md %}) to validate the consistency of the data between the source database and CockroachDB.

	<section class="filter-content" markdown="1" data-scope="postgres">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt verify \
	--source 'postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full' \
	--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
	--table-filter 'employees' \
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt verify \
	--source 'mysql://user:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt' \
	--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
	--table-filter 'employees'
	~~~
	</section>

1. Check the output to observe `verify` progress.

	A `verification in progress` indicates that the task has started:

	~~~ json
	{"level":"info","time":"2025-02-10T15:35:04-05:00","message":"verification in progress"}
	~~~

	`starting verify` messages are written for each specified table:

	~~~ json
	{"level":"info","time":"2025-02-10T15:35:04-05:00","message":"starting verify on public.employees, shard 1/1"}
	~~~

	A `finished row verification` message containing a summary is written after each table is compared. For details on the summary fields, refer to the [MOLT Verify]({% link molt/molt-verify.md %}#usage) page.

	~~~ json
	{"level":"info","type":"summary","table_schema":"public","table_name":"employees","num_truth_rows":200004,"num_success":200004,"num_conditional_success":0,"num_missing":0,"num_mismatch":0,"num_extraneous":0,"num_live_retry":0,"num_column_mismatch":0,"time":"2025-02-10T15:35:05-05:00","message":"finished row verification on public.employees (shard 1/1)"}
	~~~

	A `verification complete` message is written when the verify task succeeds:

	~~~ json
	{"level":"info","net_duration_ms":699.804875,"net_duration":"000h 00m 00s","time":"2025-02-10T15:35:05-05:00","message":"verification complete"}
	~~~