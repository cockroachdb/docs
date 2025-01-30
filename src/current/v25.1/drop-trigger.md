---
title: DROP TRIGGER
summary: The DROP TRIGGER statement drops a trigger for a specified table.
toc: true
keywords:
docs_area: reference.sql
---

The `DROP TRIGGER` [statement]({{ page.version.version }}/sql-statements.md) drops a [trigger]({{ page.version.version }}/triggers.md).

## Required privileges

To drop a trigger, a user must have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the trigger.

## Synopsis

<div>
</div>

## Parameters

|   Parameter    |                    Description                     |
|----------------|----------------------------------------------------|
| `trigger_name` | The name of the trigger to drop.                   |
| `table_name`   | The name of the table associated with the trigger. |

## Examples


### Drop a trigger

Create a sample trigger function:

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

~~~ sql
CREATE TRIGGER log_update_timestamp
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
~~~

Drop the trigger:

~~~ sql
DROP TRIGGER log_update_timestamp ON users;
~~~

## Known limitations


## See also

- [Triggers]({{ page.version.version }}/triggers.md)
- [`CREATE TRIGGER`]({{ page.version.version }}/create-trigger.md)
- [`CREATE FUNCTION`]({{ page.version.version }}/create-function.md)