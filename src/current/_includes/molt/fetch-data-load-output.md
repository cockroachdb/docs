1. Check the output to observe `fetch` progress. 

	A `starting fetch` message indicates that the task has started:

	<section class="filter-content" markdown="1" data-scope="postgres">
	~~~ json
	{"level":"info","type":"summary","num_tables":1,"cdc_cursor":"0/43A1960","time":"2025-02-10T14:28:11-05:00","message":"starting fetch"}
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	~~~ json
	{"level":"info","type":"summary","num_tables":1,"cdc_cursor":"4c658ae6-e8ad-11ef-8449-0242ac140006:1-28","time":"2025-02-10T14:28:11-05:00","message":"starting fetch"}
	~~~	
	</section>

	`data extraction` messages are written for each table that is exported to the location in `--bucket-path`:

	~~~ json
	{"level":"info","table":"public.employees","time":"2025-02-10T14:28:11-05:00","message":"data extraction phase starting"}
	~~~

	~~~ json
	{"level":"info","table":"public.employees","type":"summary","num_rows":200000,"export_duration_ms":1000,"export_duration":"000h 00m 01s","time":"2025-02-10T14:28:12-05:00","message":"data extraction from source complete"}
	~~~

	`data import` messages are written for each table that is loaded into CockroachDB:

	~~~ json
	{"level":"info","table":"public.employees","time":"2025-02-10T14:28:12-05:00","message":"starting data import on target"}
	~~~

	<section class="filter-content" markdown="1" data-scope="postgres">
	~~~ json
	{"level":"info","table":"public.employees","type":"summary","net_duration_ms":1899.748333,"net_duration":"000h 00m 01s","import_duration_ms":1160.523875,"import_duration":"000h 00m 01s","export_duration_ms":1000,"export_duration":"000h 00m 01s","num_rows":200000,"cdc_cursor":"0/43A1960","time":"2025-02-10T14:28:13-05:00","message":"data import on target for table complete"}
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	~~~ json
	{"level":"info","table":"public.employees","type":"summary","net_duration_ms":1899.748333,"net_duration":"000h 00m 01s","import_duration_ms":1160.523875,"import_duration":"000h 00m 01s","export_duration_ms":1000,"export_duration":"000h 00m 01s","num_rows":200000,"cdc_cursor":"4c658ae6-e8ad-11ef-8449-0242ac140006:1-29","time":"2025-02-10T14:28:13-05:00","message":"data import on target for table complete"}
	~~~
	</section>

	A `fetch complete` message is written when the fetch task succeeds:

	<section class="filter-content" markdown="1" data-scope="postgres">
	~~~ json
	{"level":"info","type":"summary","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","num_tables":1,"tables":["public.employees"],"cdc_cursor":"0/3F41E40","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:30:37-04:00","message":"fetch complete"}
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	~~~ json
	{"level":"info","type":"summary","fetch_id":"f5cb422f-4bb4-4bbd-b2ae-08c4d00d1e7c","num_tables":1,"tables":["public.employees"],"cdc_cursor":"4c658ae6-e8ad-11ef-8449-0242ac140006:1-29","net_duration_ms":6752.847625,"net_duration":"000h 00m 06s","time":"2024-03-18T12:30:37-04:00","message":"fetch complete"}
	~~~
	</section>