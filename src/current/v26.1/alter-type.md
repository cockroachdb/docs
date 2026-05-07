---
title: ALTER TYPE
summary: The ALTER TYPE statement modifies a user-defined data type in a database.
toc: true
docs_area: reference.sql
---

The `ALTER TYPE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) modifies a [user-defined data type]({% link {{ page.version.version }}/create-type.md %}) in the current database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_type.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`type_name` | The name of the user-defined type.
`ADD VALUE value` | Add a constant value to the user-defined type's list of values. You can optionally specify `BEFORE value` or `AFTER value` to add the value in sort order relative to an existing value.
`DROP VALUE value` |  Drop a specific value from the user-defined type's list of values.
`RENAME TO name` | Rename the user-defined type.
`RENAME VALUE value TO value` |  Rename a constant value in the user-defined type's list of values.
`SET SCHEMA`  | Set [the schema]({% link {{ page.version.version }}/sql-name-resolution.md %}) of the user-defined type.
`OWNER TO`  | Change the [role specification]({% link {{ page.version.version }}/grant.md %}) for the user-defined type's owner.

## Required privileges

- To [alter a type]({% link {{ page.version.version }}/alter-type.md %}), the user must be the owner of the type.
- To set the schema of a user-defined type, the user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the schema and the `DROP` privilege
on the type.
- To alter the owner of a user-defined type:
    - The user executing the command must be a member of the new owner role.
    - The new owner role must have the `CREATE` privilege on the schema the type belongs to.

## Known limitations

{% include {{ page.version.version }}/known-limitations/alter-type-limitations.md %}

## Example

The following example uses a [user-defined type]({% link {{ page.version.version }}/create-type.md %}).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('open', 'closed', 'inactive');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |         values         | owner
---------+--------+------------------------+--------
  public | status | {open,closed,inactive} | demo
(1 row)
~~~

### Add a value to a user-defined type

To add a value to the `status` type, use an `ADD VALUE` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE status ADD VALUE 'pending';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |             values             | owner
---------+--------+--------------------------------+--------
  public | status | {open,closed,inactive,pending} | demo
(1 row)
~~~

### Rename a value in a user-defined type

To rename a value in the `status` type, use a `RENAME VALUE` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE status RENAME VALUE 'open' TO 'active';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |              values              | owner
---------+--------+----------------------------------+--------
  public | status | {active,closed,inactive,pending} | demo
(1 row)
~~~

### Rename a user-defined type

To rename the `status` type, use a `RENAME TO` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE status RENAME TO account_status;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |      name      |              values              | owner
---------+----------------+----------------------------------+--------
  public | account_status | {active,closed,inactive,pending} | demo
(1 row)
~~~

### Drop a value in a user-defined type

To drop a value from the `account_status` type, use a `DROP VALUE` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE account_status DROP VALUE 'inactive';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |      name      |         values          | owner
---------+----------------+-------------------------+--------
  public | account_status | {active,closed,pending} | demo
(1 row)
~~~

## See also

- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ENUM`]({% link {{ page.version.version }}/enum.md %})
- [`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %})
- [`SHOW TYPES`]({% link {{ page.version.version }}/show-types.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})

<!-- REF DOC DRAFT: The following content was auto-generated. Please integrate into the sections above and remove this comment block. -->

## ALTER TYPE ... RENAME TO

The `ALTER TYPE ... RENAME TO` clause renames an existing enum type and its associated implicit array type.

### Synopsis

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TYPE type_name RENAME TO new_type_name
~~~

### Parameters

| Parameter | Description | Required |
| --- | --- | --- |
| `type_name` | The name of the existing enum type to rename | Yes |
| `new_type_name` | The new name for the enum type | Yes |

### Required privileges

The user must have the `CREATE` privilege on the schema containing the type.

### Details

- Only enum types can be renamed using this syntax. Attempting to rename composite types or domain types will result in an error stating that `ALTER TYPE` on non-enum user-defined types is not supported.
- The statement automatically renames both the enum type and its associated implicit array type.
- Renaming a type to its current name results in an error, unlike table renames which are treated as no-ops.
- The new name must not conflict with any existing objects (tables, types, domains) in the same schema.
- Multiple rename operations can be performed within a single transaction.
- The implicit array type is automatically renamed by prepending underscores to find a non-conflicting name.

### Examples

#### Basic enum type rename

{% include_cached copy-clipboard.html %}
~~~ sql
-- Create an enum type
CREATE TYPE status AS ENUM ('pending', 'approved', 'rejected');

-- Rename the enum type
ALTER TYPE status RENAME TO order_status;

-- Use the renamed type
SELECT 'approved'::order_status;
~~~

#### Multiple renames in a transaction

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
ALTER TYPE order_status RENAME TO temp_status;
ALTER TYPE temp_status RENAME TO final_status;
SELECT 'pending'::final_status;
COMMIT;
~~~

### Error conditions

The statement will fail if:

- The target type is not an enum type
- The new name already exists as a table, type, or domain in the same schema
- You attempt to rename a type to its current name
- An object with the target name is currently being dropped
- You lack the required privileges

{% include_cached copy-clipboard.html %}
~~~ sql
-- This will fail - renaming to the same name
ALTER TYPE order_status RENAME TO order_status;
~~~
~~~
ERROR: type "defaultdb.public.order_status" already exists
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- This will fail if a table named 'users' exists
ALTER TYPE order_status RENAME TO users;
~~~
~~~
ERROR: relation "defaultdb.public.users" already exists
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- This will fail if a domain named 'user_id' exists
ALTER TYPE order_status RENAME TO user_id;
~~~
~~~
ERROR: type "defaultdb.public.user_id" already exists
~~~

### See also

- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
- [Enum data types]({% link {{ page.version.version }}/enum.md %})

---

**Integration notes:**
- This content should be added to the existing `ALTER TYPE` reference page as a new section
- The main `ALTER TYPE` synopsis should be updated to include the `RENAME TO` clause
- This functionality requires cluster version 26.3 or later (gated by `isV263Active`)

<!-- END REF DOC DRAFT -->
