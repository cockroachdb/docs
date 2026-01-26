---
title: Resume Replication
summary: Resume replication after an interruption.
toc: true
docs_area: migrate
---

Resume replication using [MOLT Replicator]({% link molt/molt-replicator.md %}) by running `replicator` with the same arguments used during [initial replication setup]({% link molt/migrate-load-replicate.md %}?filters=postgres#start-replicator). Replicator will automatically resume from the saved checkpoint in the existing staging schema.

{{site.data.alerts.callout_info}}
These instructions assume you have already started replication at least once. To start replication for the first time, refer to [Load and Replicate]({% link molt/migrate-load-replicate.md %}#start-replicator).
{{site.data.alerts.end}}

{% if page.source_db_not_selectable %}
{% else %}
<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>
{% endif %}

## Resume replication after an interruption

{% include molt/replicator-resume-replication.md %}

## Troubleshooting

{% include molt/molt-troubleshooting-replication.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})