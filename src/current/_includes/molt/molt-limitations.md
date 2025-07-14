{% if page.name != "migrate-bulk-load.md" %}
### Limitations

- Running DDL on the source or target while replication is in progress can cause replication failures.
{% endif %}

<section class="filter-content" markdown="1" data-scope="oracle">
- Migrations must be performed from a single Oracle schema. You **must** include `--schema-filter` so that MOLT Fetch only loads data from the specified schema. Refer to [Schema and table filtering](#schema-and-table-filtering).
  - Specifying `--table-filter` is also strongly recommended to ensure that only necessary tables are migrated from the Oracle schema. A userscript is required to use `--table-filter` with an Oracle source.

{% if page.name != "bulk-load.md" %}
- Replication will not work for tables or column names exceeding 30 characters. This is a [limitation of Oracle LogMiner](https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-logminer-utility.html#GUID-7594F0D7-0ACD-46E6-BD61-2751136ECDB4).

- Oracle LogMiner does not support the following data types:
  - User-defined types (UDTs)
  - Nested tables
  - `VARRAY`
  - `LONGBLOB`/`CLOB` columns (over 4000 characters)

- If your Oracle workload executes `UPDATE` statements that modify only LOB columns, these `UPDATE` statements are not supported by Oracle LogMiner and will not be replicated.
- If you are using Oracle 11 and execute `UPDATE` statements on `XMLTYPE` or LOB columns, those changes are not supported by Oracle LogMiner and will be excluded from ongoing replication.
- If you are migrating LOB columns from Oracle 12c, use [AWS DMS Binary Reader](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.Oracle.html#CHAP_Source.Oracle.CDC) instead of LogMiner. Oracle LogMiner does not support LOB replication in 12c.
{% endif %}

- Oracle advises against `LONG RAW` columns and [recommends converting them to `BLOB`](https://www.orafaq.com/wiki/LONG_RAW#History). `LONG RAW` can only store binary values up to 2GB, and only one `LONG RAW` column per table is supported.
</section>