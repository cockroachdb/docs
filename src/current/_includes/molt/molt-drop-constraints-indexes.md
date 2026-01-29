To optimize data load performance, drop all non-`PRIMARY KEY` [constraints]({% link {{ site.current_cloud_version }}/alter-table.md %}#drop-constraint) and [indexes]({% link {{site.current_cloud_version}}/drop-index.md %}) on the target CockroachDB database before migrating:
{% if page.name == "molt-fetch-best-practices.md" %}
	- [`FOREIGN KEY`]({% link {{ site.current_cloud_version }}/foreign-key.md %})
	- [`UNIQUE`]({% link {{ site.current_cloud_version }}/unique.md %})
	- [Secondary indexes]({% link {{ site.current_cloud_version }}/schema-design-indexes.md %})
	- [`CHECK`]({% link {{ site.current_cloud_version }}/check.md %})
	- [`DEFAULT`]({% link {{ site.current_cloud_version }}/default-value.md %})
	- [`NOT NULL`]({% link {{ site.current_cloud_version }}/not-null.md %}) (you do not need to drop this constraint when using `drop-on-target-and-recreate` for [table handling]({% link molt/molt-fetch.md %}#handle-target-tables))

	{{site.data.alerts.callout_danger}}
	Do **not** drop [`PRIMARY KEY`]({% link {{ site.current_cloud_version }}/primary-key.md %}) constraints.
	{{site.data.alerts.end}}

	You can recreate [constraints]({% link {{ site.current_cloud_version }}/alter-table.md %}#add-constraint) and [indexes]({% link {{site.current_cloud_version}}/create-index.md %}) after loading the data.
{% else %}
- [`FOREIGN KEY`]({% link {{ site.current_cloud_version }}/foreign-key.md %})
- [`UNIQUE`]({% link {{ site.current_cloud_version }}/unique.md %})
- [Secondary indexes]({% link {{ site.current_cloud_version }}/schema-design-indexes.md %})
- [`CHECK`]({% link {{ site.current_cloud_version }}/check.md %})
- [`DEFAULT`]({% link {{ site.current_cloud_version }}/default-value.md %})
- [`NOT NULL`]({% link {{ site.current_cloud_version }}/not-null.md %}) (you do not need to drop this constraint when using `drop-on-target-and-recreate` for [table handling](#table-handling-mode))

{{site.data.alerts.callout_danger}}
Do **not** drop [`PRIMARY KEY`]({% link {{ site.current_cloud_version }}/primary-key.md %}) constraints.
{{site.data.alerts.end}}

You can [recreate the constraints and indexes after loading the data](#add-constraints-and-indexes).
{% endif %}