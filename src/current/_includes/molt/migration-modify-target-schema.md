{% if page.name == "migrate-in-phases.md" %}
{{site.data.alerts.callout_info}}
If you need the best possible [replication](#step-6-replicate-changes-to-cockroachdb) performance, you can perform this step right before [cutover](#step-8-cutover).
{{site.data.alerts.end}}
{% endif %}

You can now add any constraints or indexes that you previously [removed from the CockroachDB schema](#step-3-load-data-into-cockroachdb) to facilitate data load. If you used the `--table-handling drop-on-target-and-recreate` option for data load, you **must** manually recreate all indexes and constraints other than [`PRIMARY KEY`]({% link {{ site.current_cloud_version }}/primary-key.md %}) and [`NOT NULL`]({% link {{ site.current_cloud_version }}/not-null.md %}).

For the appropriate SQL syntax, refer to [`ALTER TABLE ... ADD CONSTRAINT`]({% link {{ site.current_cloud_version }}/alter-table.md %}#add-constraint) and [`CREATE INDEX`]({% link {{ site.current_cloud_version }}/create-index.md %}). Review the [best practices for creating secondary indexes]({% link {{ site.current_cloud_version }}/schema-design-indexes.md %}#best-practices) on CockroachDB.