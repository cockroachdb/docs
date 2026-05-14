---
title: docs: document pg_prepared_statements plan execution counters from PR #169839
summary: The `pg_prepared_statements` view shows information about all prepared statements that are available in the current session. This view provides compatibility with PostgreSQL's `pg_prepared_statements` system view.
toc: true
docs_area: reference
---

The `pg_prepared_statements` view shows information about all prepared statements that are available in the current session. This view provides compatibility with PostgreSQL's `pg_prepared_statements` system view.

## Columns

| Column | Type | Description |
|--------|------|-------------|
| `name` | STRING | name of the prepared statement |
| `statement` | STRING | query string used to create the statement |
| `prepare_time` | TIMESTAMPTZ | time at which the statement was prepared |
| `parameter_types` | STRING[] | data types of parameters (empty array if none) |
| `from_sql` | BOOL | true if the statement was prepared via SQL PREPARE command; false if prepared via frontend protocol |
| `generic_plans` | INT8 | number of times a generic plan was used when executing this prepared statement |
| `custom_plans` | INT8 | number of times a custom plan was used when executing this prepared statement |

## Plan execution counters

The `custom_plans` and `generic_plans` columns track how prepared statements are executed:

- Both counters start at 0 when a statement is prepared
- Each `EXECUTE` increments exactly one counter, regardless of `plan_cache_mode` setting
- Prepared statements without placeholders always increment `generic_plans`, even when `plan_cache_mode = force_custom_plan`
- In `auto` mode, the first 5 executions typically use custom plans, then switch to generic plans if cost-effective
- Counters reset to 0 when a prepared statement is deallocated and re-prepared

## Examples

### View all prepared statements

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT name, statement, generic_plans, custom_plans 
FROM pg_prepared_statements;
~~~

### Track plan usage for a prepared statement

{% include_cached copy-clipboard.html %}
~~~ sql
PREPARE user_query(int) AS SELECT * FROM users WHERE id = $1;
EXECUTE user_query(1);
EXECUTE user_query(2);
EXECUTE user_query(3);

SELECT name, custom_plans, generic_plans 
FROM pg_prepared_statements 
WHERE name = 'user_query';
~~~

~~~
    name    | custom_plans | generic_plans
------------+--------------+---------------
 user_query |            3 |             0
~~~

### Monitor plan type distribution

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 
  name,
  custom_plans,
  generic_plans,
  (custom_plans + generic_plans) AS total_executions,
  CASE 
    WHEN (custom_plans + generic_plans) = 0 THEN 'never executed'
    WHEN generic_plans = 0 THEN 'custom only'
    WHEN custom_plans = 0 THEN 'generic only'
    ELSE 'mixed'
  END AS plan_usage_pattern
FROM pg_prepared_statements;
~~~

## See also

- [`PREPARE`]({% link {{ page.version.version }}/prepare.md %})
- [`EXECUTE`]({% link {{ page.version.version }}/execute.md %})
- [`DEALLOCATE`]({% link {{ page.version.version }}/deallocate.md %})
- [Cluster setting `sql.prepared_statements.cache.enabled`]({% link {{ page.version.version }}/cluster-settings.md %})
- [System tables overview]({% link {{ page.version.version }}/system-catalogs.md %})
