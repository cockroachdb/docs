- Global [sorts](query-order.html).
- [Window functions](window-functions.html).
- [Hash joins](joins.html#hash-joins).
- [Merge joins](joins.html#merge-joins) on non-unique columns. Merge joins on columns that are guaranteed to have one row per value, also known as "key columns", can execute entirely in-memory.

These operations require [memory buffering](https://en.wikipedia.org/wiki/Data_buffer) during execution, and are therefore prone to spilling intermediate execution results to disk. We do not recommend using vectorized execution in production environments for operations that could spill to disk, as these operations can buffer an unlimited number of rows before they can start producing output, causing memory issues.
