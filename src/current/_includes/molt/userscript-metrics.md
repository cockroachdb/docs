<a id="script-invocations-total"></a>

- `script_invocations_total` (counter)
    - Description: Number of times [userscript]({% link molt/userscript-overview.md %}) handler functions (such as `onRowUpsert`, `onRowDelete`, and `onWrite`) are invoked.
    - Interpretation: Use to confirm that userscripts are actively being called, and detect misconfigurations where scripts filter out all data or never run.

<a id="script-rows-filtered-total"></a>

- `script_rows_filtered_total` (counter)
    - Description: Number of rows filtered out by the [userscript]({% link molt/userscript-overview.md %}) (for example, handlers that returned `null` or produced no output).
    - Interpretation: Use to identify scripts that unintentionally drop incoming data, and confirm that logic for filtering out data rows is working as intended.

<a id="script-rows-processed-total"></a>

- `script_rows_processed_total` (counter)
    - Description: Number of rows successfully processed and passed through the [userscript]({% link molt/userscript-overview.md %}).
    - Interpretation: Use to measure how many rows are being transformed or routed successfully. Compare with [`script_rows_filtered_total`](#script-rows-filtered-total) to understand filtering ratios and validate script logic.

<a id="script-exec-time-seconds"></a>

- `script_exec_time_seconds` (histogram)
    - Description: Measures the execution time of each [userscript]({% link molt/userscript-overview.md %}) function call.
    - Interpretation: Use to detect slow or inefficient userscripts that could introduce replication lag, and identify performance bottlenecks caused by complex transformations or external lookups.

<a id="script-entry-wait-seconds"></a>

- `script_entry_wait_seconds` (histogram)
    - Description: Measures the latency between a row entering the Replicator [userscript]({% link molt/userscript-overview.md %}) queue and the start of its execution inside the JavaScript runtime.
    - Interpretation: Use to detect whether userscripts are queuing up before execution (higher values indicate longer wait times), and monitor how busy the userscript runtime pool is under load.

<a id="script-errors-total"></a>

- `script_errors_total` (counter)
    - Description: Number of errors that occurred during [userscript]({% link molt/userscript-overview.md %}) execution (for example, JavaScript exceptions or runtime errors).
    - Interpretation: Use to surface failing scripts or invalid assumptions about incoming data, and monitor script stability over time and catch regressions early.