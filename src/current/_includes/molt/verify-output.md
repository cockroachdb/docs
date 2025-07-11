1. Issue the [MOLT Verify]({% link molt/molt-verify.md %}) command, specifying the source and target [connection strings](#connection-strings) and the tables to validate.

	<section class="filter-content" markdown="1" data-scope="postgres">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt verify \
	--source $SOURCE \ 
	--target $TARGET \
	--table-filter 'employees|payments|orders'
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	{% include_cached copy-clipboard.html %} 
	~~~ shell
	molt verify \
	--source $SOURCE \ 
	--target $TARGET \
	--table-filter 'employees|payments|orders'
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt verify \
	--source $SOURCE \ 
	--target $TARGET \
	--table-filter 'employees|payments|orders'
	~~~

	{{site.data.alerts.callout_info}}
	With Oracle Multitenant deployments, `--source-cdb` is **not** necessary for `verify`.
	{{site.data.alerts.end}}
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