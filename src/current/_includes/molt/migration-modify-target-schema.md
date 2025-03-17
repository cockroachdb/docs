{% if page.name == "migrate-in-phases.md" %}
{{site.data.alerts.callout_info}}
For the best possible [replication](#step-6-replicate-changes-to-cockroachdb) performance, perform this step right before [cutover](#step-8-cutover).
{{site.data.alerts.end}}
{% endif %}

You can now add any constraints or indexes that you previously [removed from the CockroachDB schema](#step-3-load-data-into-cockroachdb).

For the appropriate SQL syntax, refer to [`ALTER TABLE ... ADD CONSTRAINT`]({% link {{ page.version.version }}/alter-table.md %}#add-constraint) and [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %}). Review the [best practices for creating secondary indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices) on CockroachDB.