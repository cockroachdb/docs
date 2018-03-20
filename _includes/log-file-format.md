The following file format is used by both execution and audit logs.  The column numbers in the example log line below correspond to the list that follows.

~~~
[1]     [2]             [3] [4]                 [5a]                     [5b]       [5c]  [6]  [7a] [7b]        [7c]            [7d]                         [7e]  [7f]  [7g] [7h]
I180211 07:30:48.832004 317 sql/exec_log.go:90  [client=127.0.0.1:62503, user=root, n1]   13   exec "cockroach" {"ab"[53]:READ} "SELECT nonexistent FROM ab" {}    0.123 12   ERROR
~~~

1. Date
2. Time (in UTC)
3. Goroutine ID
4. The place in the source code that generated the log line
5. Logging tags
   - a. Client address
   - b. Username
   - c. Node ID
6. Log entry counter (Monotonically increasing)
7. Log message:
   - a. Label indicating where the data was generated (useful for troubleshooting)
   - b. Current value of the [`application_name`](set-vars.html) session setting
   - c. Logging trigger:
       - `"{}"` for execution logs, since all activities are added to the execution log
       - The list of triggering tables and access modes for audit logs, since only certain (read/write) activities are added to the audit log
   - d. Full text of the query (Note: May contain PII)
   - e. Placeholder values, if any
   - f. Query execution time (in milliseconds)
   - g. Number of rows produced
   - h. Status of the query
       - `OK` for success
       - `ERROR` or the full error message otherwise
