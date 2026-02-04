### Limitations

#### Fetch limitations

<section class="filter-content" markdown="1" data-scope="postgres">
- `OID LOB` types in PostgreSQL are not supported, although similar types like `BYTEA` are supported.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
- Migrations must be performed from a single Oracle schema. You **must** include [`--schema-filter`](#schema-and-table-filtering) so that MOLT Fetch only loads data from the specified schema. Refer to [Schema and table filtering](#schema-and-table-filtering).
  - Specifying [`--table-filter`](#schema-and-table-filtering) is also strongly recommended to ensure that only necessary tables are migrated from the Oracle schema.
- Oracle advises against `LONG RAW` columns and [recommends converting them to `BLOB`](https://www.orafaq.com/wiki/LONG_RAW#History). `LONG RAW` can only store binary values up to 2GB, and only one `LONG RAW` column per table is supported.
</section>

- Only tables with [primary key]({% link {{ site.current_cloud_version }}/primary-key.md %}) types of [`INT`]({% link {{ site.current_cloud_version }}/int.md %}), [`FLOAT`]({% link {{ site.current_cloud_version }}/float.md %}), or [`UUID`]({% link {{ site.current_cloud_version }}/uuid.md %}) can be sharded with [`--export-concurrency`]({% link molt/molt-fetch-best-practices.md %}#configure-the-source-database-and-connection).

{% if page.name contains "delta" %}
#### Replicator limitations

- Replication modes require connection to the primary instance (PostgreSQL primary, MySQL primary/master, or Oracle primary). MOLT cannot obtain replication checkpoints or transaction metadata from replicas.

<section class="filter-content" markdown="1" data-scope="mysql">
- MySQL replication is supported only with [GTID](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html)-based configurations. Binlog-based features that do not use GTID are not supported.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
- Replication will not work for tables or column names exceeding 30 characters. This is a [limitation of Oracle LogMiner](https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-logminer-utility.html#GUID-7594F0D7-0ACD-46E6-BD61-2751136ECDB4).
- The following data types are not supported for replication:
  - User-defined types (UDTs)
  - Nested tables
  - `VARRAY`
  - `LONGBLOB`/`CLOB` columns (over 4000 characters)
- If your Oracle workload executes `UPDATE` statements that modify only LOB columns, these `UPDATE` statements are not supported by Oracle LogMiner and will not be replicated.
- If you are using Oracle 11 and execute `UPDATE` statements on `XMLTYPE` or LOB columns, those changes are not supported by Oracle LogMiner and will be excluded from ongoing replication.
- If you are migrating LOB columns from Oracle 12c, use [AWS DMS Binary Reader](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.Oracle.html#CHAP_Source.Oracle.CDC) instead of LogMiner. Oracle LogMiner does not support LOB replication in 12c.
</section>

- Running DDL on the source or target while replication is in progress can cause replication failures.
- `TRUNCATE` operations on the source are not captured. Only `INSERT`, `UPDATE`, `UPSERT`, and `DELETE` events are replicated.
- Changes to virtual columns are not replicated automatically. To migrate these columns, you must define them explicitly with [transformation rules]({% link molt/molt-fetch.md %}#define-transformations).
{% endif %}