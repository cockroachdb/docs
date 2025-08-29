---
title: DROP TRIGGER
summary: The DROP TRIGGER statement drops a trigger for a specified table.
toc: true
keywords:
docs_area: reference.sql
---

The `DROP TRIGGER` [statement]({% link {{ page.version.version }}/sql-statements.md %}) drops a [trigger]({% link {{ page.version.version }}/triggers.md %}).

## Required privileges

To drop a trigger, a user must have the `DROP` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the trigger.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_trigger.html %}
</div>

## Parameters

|   Parameter    |                    Description                     |
|----------------|----------------------------------------------------|
| `trigger_name` | The name of the trigger to drop.                   |
| `table_name`   | The name of the table associated with the trigger. |

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Drop a trigger

Create a sample trigger function:

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

Create a sample trigger:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TRIGGER log_update_timestamp
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
~~~

Drop the trigger:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP TRIGGER log_update_timestamp ON users;
~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/drop-trigger-limitations.md %}

## See also

- [Triggers]({% link {{ page.version.version }}/triggers.md %})
- [`CREATE TRIGGER`]({% link {{ page.version.version }}/create-trigger.md %})
- [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %})