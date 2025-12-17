Add any constraints or indexes that you previously [removed from the CockroachDB schema](#drop-constraints-and-indexes) to facilitate data load. 

{{site.data.alerts.callout_info}}
If you used the `--table-handling drop-on-target-and-recreate` option for data load, only [`PRIMARY KEY`]({% link "{{ site.current_cloud_version }}/primary-key.md" %}) and [`NOT NULL`]({% link "{{ site.current_cloud_version }}/not-null.md" %}) constraints are preserved. You **must** manually recreate all other constraints and indexes.
{{site.data.alerts.end}}

For the appropriate SQL syntax, refer to [`ALTER TABLE ... ADD CONSTRAINT`]({% link "{{ site.current_cloud_version }}/alter-table.md" %}#add-constraint) and [`CREATE INDEX`]({% link "{{ site.current_cloud_version }}/create-index.md" %}). Review the [best practices for creating secondary indexes]({% link "{{ site.current_cloud_version }}/schema-design-indexes.md" %}#best-practices) on CockroachDB.