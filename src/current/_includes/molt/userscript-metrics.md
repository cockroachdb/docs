<a id="script-invocations-total"></a> 

- `script_invocations_total` (counter)

  - Counts how many times userscript handler functions (such as `onRowUpsert`, `onRowDelete`, and `onWrite`) are invoked.
  - Use it to:
      - Confirm that userscripts are actively being called.
      - Detect misconfigurations where scripts filter out all data or never run.

<a id="script-rows-filtered-total"></a> 

- `script_rows_filtered_total` (counter)

  - Counts how many rows were filtered out by the userscript (for example, handlers that returned `null` or produced no output).
  - Use it to:
      - Identify scripts that unintentionally drop incoming data.
      - Confirm that logic for filtering out data rows is working as intended.

<a id="script-rows-processed-total"></a> 

- `script_rows_processed_total` (counter)

  - Counts how many rows were successfully processed and passed through the userscript.
  - Use it to:
      - Measure how many rows are being transformed or routed successfully.
      - Compare with `script_rows_filtered_total` to understand filtering ratios and validate script logic.

<a id="script-exec-time-seconds"></a> 

- `script_exec_time_seconds` (histogram)

  - Measures the execution time of each userscript function call.
  - Use it to:
      - Detect slow or inefficient userscripts that could introduce replication lag.
      - Identify performance bottlenecks caused by complex transformations or external lookups.

<a id="script-entry-wait-seconds"></a> 

- `script_entry_wait_seconds` (histogram)

  - Measures the latency between a row entering the Replicator userscript queue and the start of its execution inside the JavaScript runtime.
  - Use it to:
      - Detect whether userscripts are queuing up before execution (higher values indicate longer wait times).
      - Monitor how busy the userscript runtime pool is under load.

<a id="script-errors-total"></a> 

- `script_errors_total` (counter)

  - Counts the total number of errors that occurred during userscript execution (for example, JavaScript exceptions or runtime errors).
  - Use it to:
      - Surface failing scripts or invalid assumptions about incoming data.
      - Monitor script stability over time and catch regressions early.