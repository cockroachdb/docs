In _regional by row_ tables, individual rows are optimized for access from different regions. This setting automatically divides a table and all of [its indexes](multiregion-overview.html#indexes-on-regional-by-row-tables) into [partitions](partitioning.html), with each partition optimized for access from a different region. Like [regional tables](multiregion-overview.html#regional-tables), _regional by row_ tables are optimized for access from a single region. However, that region is specified at the row level instead of applying to the whole table.

Use regional by row tables when your application requires low-latency reads and writes at a row level where individual rows are primarily accessed from a single region. For example, a users table in a global application may need to keep some users' data in specific regions for better performance.

For an example of a table that can benefit from the _regional by row_ setting in a multi-region deployment, see the `users` table from the [MovR application](movr.html).

For instructions showing how to set a table's locality to `REGIONAL BY ROW`, see [`ALTER TABLE ... SET LOCALITY`](set-locality.html#regional-by-row)
