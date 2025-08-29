---
title: ALTER PROCEDURE
summary: The ALTER PROCEDURE statement modifies a stored procedure.
toc: true
keywords:
docs_area: reference.sql
---

The `ALTER PROCEDURE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) modifies a [stored procedure]({% link {{ page.version.version }}/stored-procedures.md %}).

## Required privileges

Refer to the respective [subcommands](#subcommands).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_proc.html %}
</div>

## Parameters

|    Parameter    |                Description                |
|-----------------|-------------------------------------------|
| `proc_name`     | The name of the procedure to alter.       |
| `routine_param` | An optional list of procedure parameters. |

## Subcommands

Subcommand | Description
-----------|------------
[`OWNER TO`](#owner-to) | Change the owner of a procedure.
[`RENAME TO`](#rename-to) | Change the name of a procedure.
[`SET SCHEMA`](#set-schema) | Change the [schema]({% link {{ page.version.version }}/sql-name-resolution.md %}) of a procedure.

### `OWNER TO`

`ALTER PROCEDURE ... OWNER TO` is used to change the owner of a procedure.

#### Required privileges

- To alter the owner of a procedure, the new owner must have [`CREATE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the procedure.
- To alter a procedure, a user must [own]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) the procedure.
- To alter a procedure, a user must have [`DROP` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the procedure.

#### Parameters

Parameter | Description |
----------|-------------|
`role_spec` | The role to set as the owner of the procedure.

See [Synopsis](#synopsis).

### `RENAME TO`

`ALTER PROCEDURE ... RENAME TO` changes the name of a procedure.

#### Required privileges

- To alter a procedure, a user must [own]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) the procedure.
- To alter a procedure, a user must have [`DROP` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the procedure.

#### Parameters

Parameter | Description |
----------|-------------|
`proc_new_name` | The new name of the procedure.

See [Synopsis](#synopsis).

### `SET SCHEMA`

`ALTER PROCEDURE ... SET SCHEMA` changes the [schema]({% link {{ page.version.version }}/sql-name-resolution.md %}) of a procedure.

{{site.data.alerts.callout_info}}
CockroachDB supports `SET SCHEMA` as an [alias for setting the `search_path` session variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables).
{{site.data.alerts.end}}

#### Required privileges

- To change the schema of a procedure, a user must have [`CREATE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the new schema.
- To alter a procedure, a user must [own]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) the procedure.
- To alter a procedure, a user must have [`DROP` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the procedure.

#### Parameters

Parameter | Description |
----------|-------------|
`schema_name` | The name of the new schema for the procedure.

See [Synopsis](#synopsis).

## Examples

### Rename a stored procedure

The following statement renames the [`delete_earliest_histories` example procedure]({% link {{ page.version.version }}/stored-procedures.md %}#create-a-stored-procedure-using-pl-pgsql) to `delete_histories`:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER PROCEDURE delete_earliest_histories RENAME TO delete_histories;
~~~

## See also

- [Stored Procedures]({% link {{ page.version.version }}/stored-procedures.md %})
- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})
- [`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %})
- [`CALL`]({% link {{ page.version.version }}/call.md %})
- [`DROP PROCEDURE`]({% link {{ page.version.version }}/drop-procedure.md %})