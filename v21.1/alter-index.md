---
title: ALTER INDEX
summary: Use the ALTER INDEX statement to change an existing index.
toc: true
---

The `ALTER INDEX` [statement](sql-statements.html) applies a schema change to an index. For information on using `ALTER INDEX`, see the pages for its relevant [subcommands](#subcommands).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

**alter_index_partition_by_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.1/grammar_svg/alter_index_partition_by.html %}
</div>

**alter_zone_index_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.1/grammar_svg/alter_zone_index.html %}
</div>

**rename_index_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.1/grammar_svg/rename_index.html %}
</div>

**split_index_at_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.1/grammar_svg/split_index_at.html %}
</div>

**unsplit_index_at_stmt ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.1/grammar_svg/unsplit_index_at.html %}
</div>

## Subcommands

Subcommand | Description
-----------|------------
[`CONFIGURE ZONE`](configure-zone.html) | [Configure replication zones](configure-replication-zones.html) for an index.
[`PARTITION BY`](partition-by.html)  | Partition, re-partition, or un-partition an index. ([Enterprise-only](enterprise-licensing.html)).
[`RENAME TO`](rename-index.html) | Change the name of an index.
[`SPLIT AT`](split-at.html) | Force a range split at the specified row in the index.
[`UNSPLIT AT`](unsplit-at.html) | Remove a range split enforcement at a specified row in the index.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

### Rename an index

{% include {{ page.version.version }}/sql/rename-index.md %}

### Create a replication zone for a secondary index

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-secondary-index.md %}

### Define a list partition on a table or secondary index

{% include {{page.version.version}}/sql/define-a-list-partition.md table-index="index" %}

### Define a range partition on a table or secondary index

{% include {{page.version.version}}/sql/define-a-range-partition.md table-index="index" %}

### Define subpartitions on a table or secondary index

{% include {{page.version.version}}/sql/define-subpartitions.md table-index="index" %}

### Repartition a table or secondary index

{% include {{page.version.version}}/sql/repartition.md table-index="index" %}

### Unpartition a table or secondary index

{% include {{page.version.version}}/sql/unpartition.md table-index="index" %}

### Split an index

{% include {{page.version.version}}/sql/split-an-index.md %}

### Unsplit an index at specific points

{% include {{page.version.version}}/sql/unsplit-an-index.md %}
