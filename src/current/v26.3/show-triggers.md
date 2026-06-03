---
title: SHOW TRIGGERS
summary: The SHOW TRIGGERS statement lists the triggers on a table.
toc: true
docs_area: reference.sql
---

The `SHOW TRIGGERS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the [triggers]({% link {{ page.version.version }}/triggers.md %}) defined on a table.

## Required privileges

The user must have any [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the target table.

## Synopsis

<div>
{% capture diagram_include %}cockroach-generated/release-26.3/sql-diagrams/show_triggers.html{% endcapture %}{% include {{ diagram_include }} %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which to list triggers.

## Response

Field | Description
------|------------
`trigger_name` | The name of the trigger.
`enabled` | Whether the trigger is enabled.

## Example

Create a sample table and trigger:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE users (id INT PRIMARY KEY, name STRING);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Current timestamp: %', now();
  RETURN NEW;
END;
$$ LANGUAGE PLpgSQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TRIGGER log_update_timestamp
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
~~~

List the triggers on the table:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW TRIGGERS FROM users;
~~~

~~~
      trigger_name     | enabled
-----------------------+----------
  log_update_timestamp |    t
(1 row)
~~~

## See also

- [Triggers]({% link {{ page.version.version }}/triggers.md %})
- [`CREATE TRIGGER`]({% link {{ page.version.version }}/create-trigger.md %})
- [`DROP TRIGGER`]({% link {{ page.version.version }}/drop-trigger.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
