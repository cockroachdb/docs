- Use index keys with a random distribution of values, so that transactions over different rows are more likely to operate on separate data ranges. See the [SQL FAQs]({% link "{{ page.version.version }}/sql-faqs.md" %}#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) on row IDs for suggestions.

- Place parts of the records that are modified by different transactions in different tables. That is, increase [normalization](https://wikipedia.org/wiki/Database_normalization). However, there are benefits and drawbacks to increasing normalization.

    - Benefits of increasing normalization:

        - Can improve performance for write-heavy workloads. This is because, with increased normalization, a given business fact must be written to one place rather than to multiple places.  
        - Allows separate transactions to modify related underlying data without causing [contention](#transaction-contention).
        - Reduces the chance of data inconsistency, since a given business fact must be written only to one place.
        - Reduces or eliminates data redundancy.
        - Uses less disk space.

    - Drawbacks of increasing normalization:

        - Can reduce performance for read-heavy workloads. This is because increasing normalization results in more joins, and can make the SQL more complicated in other ways.
        - More complex data model.

    - In general:

        - Increase normalization for write-intensive and read/write-intensive transactional workloads.
        - Do not increase normalization for read-intensive reporting workloads.

- If the application strictly requires operating on very few different index keys, consider using [`ALTER ... SPLIT AT`]({% link "{{ page.version.version }}/alter-table.md" %}#split-at) so that each index key can be served by a separate group of nodes in the cluster.

- If you are working with a table that **must** be indexed on sequential keys, consider using [hash-sharded indexes]({% link "{{ page.version.version }}/hash-sharded-indexes.md" %}). For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see the blog post [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/). As part of this, we recommend doing thorough performance testing with and without hash-sharded indexes to see which works best for your application.

- To avoid read hot spots:

    - Increase data distribution, which will allow for more ranges. The hot spot exists because the data being accessed is all co-located in one range.
    - Increase [load balancing]({% link "{{ page.version.version }}/recommended-production-settings.md" %}#load-balancing) across more nodes in the same range. Most transactional reads must go to the leaseholder in CockroachDB, which means that opportunities for load balancing over replicas are minimal.

        However, the following features do permit load balancing over replicas:

        - [Global tables]({% link "{{ page.version.version }}/global-tables.md" %}).
        - [Follower reads]({% link "{{ page.version.version }}/follower-reads.md" %}) (both the bounded staleness and the exact staleness kinds).

        In these cases, more replicas will help, up to the number of nodes in the cluster.