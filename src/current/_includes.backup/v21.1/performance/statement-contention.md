Find the transactions and statements within the transactions that are experiencing contention. CockroachDB has several ways of tracking down transactions that are experiencing contention:

* The [Transactions page](ui-transactions-page.html) and the [Statements page](ui-statements-page.html) in the DB Console allow you to sort by contention.
* Create views for the information in the `crdb_internal.cluster_contention_events` table to find the tables and indexes that are experiencing contention.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE VIEW contended_tables (database_name, schema_name, name, num_contention_events)
    AS SELECT DISTINCT database_name, schema_name, name, num_contention_events
    FROM crdb_internal.cluster_contention_events
    JOIN crdb_internal.tables
    ON crdb_internal.cluster_contention_events.table_id = crdb_internal.tables.table_id
    ORDER BY num_contention_events desc;

    CREATE VIEW contended_indexes (database_name, schema_name, name, index_name, num_contention_events) AS
    SELECT DISTINCT database_name, schema_name, name, index_name, num_contention_events
    FROM crdb_internal.cluster_contention_events, crdb_internal.tables, crdb_internal.table_indexes
    WHERE (crdb_internal.cluster_contention_events.index_id = crdb_internal.table_indexes.index_id
      AND crdb_internal.cluster_contention_events.table_id = crdb_internal.table_indexes.descriptor_id)
    AND (crdb_internal.cluster_contention_events.table_id = crdb_internal.tables.table_id)
    ORDER BY num_contention_events DESC;
    ~~~

    Then run a select statement from the `contended_tables` or `contended_indexes` view.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM contended_tables;
    SELECT * FROM contended_indexes;
    ~~~

After identifying the tables and indexes experiencing contention, follow the steps [outlined in our best practices recommendations to avoid contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
