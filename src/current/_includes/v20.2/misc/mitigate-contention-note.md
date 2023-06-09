{{site.data.alerts.callout_info}}
It's possible to mitigate read-write contention and reduce transaction retries using the following techniques:  
1. By performing reads using [`AS OF SYSTEM TIME`](performance-best-practices-overview.html#use-as-of-system-time-to-decrease-conflicts-with-long-running-queries).  
2. By using [`SELECT FOR UPDATE`](select-for-update.html) to order transactions by controlling concurrent access to one or more rows of a table.  This reduces retries in scenarios where a transaction performs a read and then updates the same row it just read.
{{site.data.alerts.end}}
