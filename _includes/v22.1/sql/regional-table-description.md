In a _regional_ table, access to the table will be fast in the table's "home region" and slower in other regions. In other words, CockroachDB optimizes access to data in a regional table from a single region. By default, a regional table's home region is the [database's primary region](multiregion-overview.html#database-regions), but that can be changed to use any region in the database. Regional tables work well when your application requires low-latency reads and writes for an entire table from a single region.

For instructions showing how to set a table's locality to `REGIONAL BY TABLE`, see [`ALTER TABLE ... SET LOCALITY`](set-locality.html#regional-by-table).

By default, all tables in a multi-region database are _regional_ tables that use the database's primary region. Unless you know your application needs different performance characteristics than regional tables provide, there is no need to change this setting.
