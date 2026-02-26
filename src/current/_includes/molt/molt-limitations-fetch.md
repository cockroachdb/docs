- Only tables with [primary key]({% link {{ site.current_cloud_version }}/primary-key.md %}) types of [`INT`]({% link {{ site.current_cloud_version }}/int.md %}), [`FLOAT`]({% link {{ site.current_cloud_version }}/float.md %}), or [`UUID`]({% link {{ site.current_cloud_version }}/uuid.md %}) can be sharded with [`--export-concurrency`]({% link molt/molt-fetch-best-practices.md %}#configure-the-source-database-and-connection).
- `GEOMETRY` and `GEOGRAPHY` types are not supported.

{% if page.name contains "molt-fetch" %}
The following limitation is specific to PostgreSQL sources:

- `OID LOB` types in PostgreSQL are not supported, although similar types like `BYTEA` are supported.
</section>

The following limitations are specific to Oracle sources:

- Migrations must be performed from a single Oracle schema. You **must** include [`--schema-filter`]({% link molt/molt-fetch.md %}#select-data-to-migrate) so that MOLT Fetch only loads data from the specified schema. Refer to [Schema and table filtering]({% link molt/molt-fetch.md %}#select-data-to-migrate).
  - Specifying [`--table-filter`]({% link molt/molt-fetch.md %}#select-data-to-migrate) is also strongly recommended to ensure that only necessary tables are migrated from the Oracle schema.
- Oracle advises against `LONG RAW` columns and [recommends converting them to `BLOB`](https://www.orafaq.com/wiki/LONG_RAW#History). `LONG RAW` can only store binary values up to 2GB, and only one `LONG RAW` column per table is supported.
{% else %}
<section class="filter-content" markdown="1" data-scope="postgres">
- `OID LOB` types in PostgreSQL are not supported, although similar types like `BYTEA` are supported.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
- Migrations must be performed from a single Oracle schema. You **must** include [`--schema-filter`]({% link molt/molt-fetch.md %}#select-data-to-migrate) so that MOLT Fetch only loads data from the specified schema. Refer to [Schema and table filtering]({% link molt/molt-fetch.md %}#select-data-to-migrate).
  - Specifying [`--table-filter`]({% link molt/molt-fetch.md %}#select-data-to-migrate) is also strongly recommended to ensure that only necessary tables are migrated from the Oracle schema.
- Oracle advises against `LONG RAW` columns and [recommends converting them to `BLOB`](https://www.orafaq.com/wiki/LONG_RAW#History). `LONG RAW` can only store binary values up to 2GB, and only one `LONG RAW` column per table is supported.
</section>
{% endif %}