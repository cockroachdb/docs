- MOLT Verify compares 20,000 rows at a time by default, and row values can change between batches, potentially resulting in temporary inconsistencies in data. To configure the row batch size, use the `--row_batch_size` [flag]({% link molt/molt-verify.md %}#flags).
- MOLT Verify checks for collation mismatches on [primary key]({% link {{site.current_cloud_version}}/primary-key.md %}) columns. This may cause validation to fail when a [`STRING`]({% link {{site.current_cloud_version}}/string.md %}) is used as a primary key and the source and target databases are using different [collations]({% link {{site.current_cloud_version}}/collate.md %}).
- MOLT Verify might give an error in case of schema changes on either the source or target database.
- [Geospatial types]({% link {{site.current_cloud_version}}/spatial-data-overview.md %}#spatial-objects) cannot yet be compared.

{% if page.name contains "molt-verify" %}
The following limitation is specific to MySQL sources:

- MOLT Verify only supports comparing one MySQL database to a whole CockroachDB schema (which is assumed to be `public`).
{% else %}
<section class="filter-content" markdown="1" data-scope="mysql">
- MOLT Verify only supports comparing one MySQL database to a whole CockroachDB schema (which is assumed to be `public`).
</section>
{% endif %}