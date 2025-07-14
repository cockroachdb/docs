---
title: Resume Replication
summary: Restart ongoing replication using an existing staging schema checkpoint.
toc: true
docs_area: migrate
---

Use `replication-only` mode to resume replication to CockroachDB after an interruption, without reloading data.

{{site.data.alerts.callout_info}}
These steps assume that you previously started replication. Refer to [Load and Replicate]({% link molt/migrate-data-load-and-replication.md %}#replicate-changes-to-cockroachdb) or [Load and Replicate Separately]({% link molt/migrate-data-load-replicate-only.md %}#replicate-changes-to-cockroachdb).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

## Resume replication after interruption

{% include molt/fetch-replicator-flags.md %}

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to start replication on CockroachDB, specifying [`--mode replication-only`]({% link molt/molt-fetch.md %}#fetch-mode).

	<section class="filter-content" markdown="1" data-scope="postgres">
	Be sure to specify the same `--pglogical-replication-slot-name` value that you provided on [data load]({% link molt/migrate-data-load-replicate-only.md %}#load-data-into-cockroachdb).

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \ 
	--target $TARGET \
	--table-filter 'employees|payments|orders' \
	--pglogical-replication-slot-name cdc_slot \
	--replicator-flags '--stagingSchema _replicator_1749699789613149000 --metricsAddr :30005' \
	--mode replication-only
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \ 
	--target $TARGET \
	--table-filter 'employees|payments|orders' \
	--non-interactive \
	--replicator-flags '--stagingSchema _replicator_1749699789613149000 --metricsAddr :30005 --userscript table_filter.ts' \
	--mode replication-only
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--source-cdb $SOURCE_CDB \
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--replicator-flags '--stagingSchema _replicator_1749699789613149000 --metricsAddr :30005 --userscript table_filter.ts' \
	--mode 'replication-only'
	~~~
	</section>

	Replication resumes from the last checkpoint without performing a fresh load.

{% include molt/fetch-replication-output.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})