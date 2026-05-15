---
title: backup: add BEFORE/AFTER syntax to SHOW BACKUPS
summary: Enhanced `SHOW BACKUPS` Documentation
toc: true
docs_area: reference
---

## Enhanced `SHOW BACKUPS` Documentation

### Time filtering options

The `SHOW BACKUPS` statement now supports optional time-based filtering to display backups created within specific time ranges.

## Synopsis

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN location [AFTER timestamp] [BEFORE timestamp]
~~~

## Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| `location` | the backup collection location | Yes |
| `AFTER timestamp` | show only backups created after the specified timestamp | No |
| `BEFORE timestamp` | show only backups created before the specified timestamp | No |

{{site.data.alerts.callout_info}}
The `AFTER` and `BEFORE` clauses can be used independently or combined. When both are specified, the order does not matter; `BEFORE timestamp AFTER timestamp` is equivalent to `AFTER timestamp BEFORE timestamp`.
{{site.data.alerts.end}}

## Examples

Show all backups in a collection:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN 's3://bucket/backup-collection';
~~~

Show backups created after a specific timestamp:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN 's3://bucket/backup-collection' AFTER '2024-01-15 10:00:00';
~~~

Show backups created before a specific timestamp:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN 's3://bucket/backup-collection' BEFORE '2024-01-20 18:30:00';
~~~

Show backups created within a specific time range:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN 's3://bucket/backup-collection' AFTER '2024-01-15 10:00:00' BEFORE '2024-01-20 18:30:00';
~~~

The time filter clauses accept the same order regardless of position:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN 's3://bucket/backup-collection' BEFORE '2024-01-20 18:30:00' AFTER '2024-01-15 10:00:00';
~~~

Use with placeholders:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN $1 AFTER $2 BEFORE $3;
~~~

## See also

- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})

---

This documentation addition covers the new time filtering functionality added to `SHOW BACKUPS`. The syntax supports flexible timestamp-based filtering that helps users narrow down backup listings to specific time periods, which is particularly useful for large backup collections.
