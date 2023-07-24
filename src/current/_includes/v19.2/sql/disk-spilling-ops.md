- Global [sorts](query-order.html)
- [Window functions](window-functions.html)
- [Unordered aggregations](query-order.html)
- [Hash joins](joins.html#hash-joins)
- [Merge joins](joins.html#merge-joins) on non-unique columns. Merge joins on columns that are guaranteed to have one row per value, also known as "key columns", can execute entirely in-memory.

During the execution of these operations, some intermediate results are written to an [in-memory data buffer](https://en.wikipedia.org/wiki/Data_buffer). In CockroachDB v19.2, the vectorized engine does not spill the contents of intermediate data buffers to disk. As a result, memory-intensive queries can buffer an unlimited quantity of data in memory and lead to memory issues.
