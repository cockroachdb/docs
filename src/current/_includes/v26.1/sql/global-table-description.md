A _global_ table is optimized for low-latency reads from every region in the database. This means that any region can effectively act as the home region of the table. The tradeoff is that writes will incur higher latencies from any given region, since writes have to be replicated across every region to make the global low-latency reads possible. Use global tables when your application has a "read-mostly" table of reference data that is rarely updated, and needs to be available to all regions.

For an example of a table that can benefit from the _global_ table locality setting in a multi-region deployment, see the `promo_codes` table from the [MovR application]({% link {{ page.version.version }}/movr.md %}).

For instructions showing how to set a table's locality to `GLOBAL`, see [`ALTER TABLE ... SET LOCALITY`]({% link {{ page.version.version }}/alter-table.md %}#global).

For more information about global tables, including troubleshooting information, see [Global Tables]({% link {{ page.version.version }}/global-tables.md %}).
