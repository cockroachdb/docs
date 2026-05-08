---
title: sql/parser: default GENERATED ALWAYS AS to VIRTUAL when keyword omitted
summary: Generated column syntax enhancement
toc: true
docs_area: reference.sql
---

## Generated column syntax enhancement

This PR enhances the syntax for generated columns in `CREATE TABLE` and `ALTER TABLE` statements. The `STORED` or `VIRTUAL` keyword is now optional when defining generated columns, with `VIRTUAL` as the default when neither is specified.

### Enhanced syntax

**Previous syntax (still supported)**:
```sql
column_name data_type GENERATED ALWAYS AS (expression) STORED
column_name data_type GENERATED ALWAYS AS (expression) VIRTUAL
column_name data_type AS (expression) STORED
column_name data_type AS (expression) VIRTUAL
```

**New syntax**:
```sql
column_name data_type GENERATED ALWAYS AS (expression)
column_name data_type AS (expression)
```

When neither `STORED` nor `VIRTUAL` is specified, the column defaults to `VIRTUAL`, matching PostgreSQL behavior.

### Description

Generated columns can now be defined without explicitly specifying `STORED` or `VIRTUAL`. This enhancement provides PostgreSQL compatibility and simplifies the most common use case (virtual generated columns). All existing syntax remains fully supported.

### Parameters

| Parameter | Description | Required |
|-----------|-------------|----------|
| `column_name` | name of the generated column | Yes |
| `data_type` | data type of the column | Yes |
| `expression` | expression used to compute the column value | Yes |
| `STORED` | creates a stored generated column (computed at write time) | No |
| `VIRTUAL` | creates a virtual generated column (computed at read time) | No |

{{site.data.alerts.callout_info}}
When neither `STORED` nor `VIRTUAL` is specified, the column is created as `VIRTUAL` by default.
{{site.data.alerts.end}}

### Examples

**Virtual generated column with default behavior**:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE orders (
    id INT PRIMARY KEY,
    price DECIMAL(10,2),
    tax_rate DECIMAL(4,4),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (price * (1 + tax_rate))
);
~~~

**Using the shorthand syntax**:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT AS (first_name || ' ' || last_name)
);
~~~

**Explicit virtual column (equivalent to the above)**:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT AS (first_name || ' ' || last_name) VIRTUAL
);
~~~

**Stored generated column (explicit keyword required)**:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE inventory (
    id INT PRIMARY KEY,
    quantity INT,
    reserved INT,
    available INT AS (quantity - reserved) STORED
);
~~~

**Adding a generated column with ALTER TABLE**:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE customers 
ADD COLUMN email_domain TEXT AS (split_part(email, '@', 2));
~~~

### Backwards compatibility

All existing generated column syntax remains fully supported:
- `GENERATED ALWAYS AS (expr) STORED` 
- `GENERATED ALWAYS AS (expr) VIRTUAL`
- `AS (expr) STORED`
- `AS (expr) VIRTUAL`

This change is additive and does not break any existing table definitions.

### PostgreSQL compatibility

This enhancement aligns CockroachDB's behavior with PostgreSQL, which also defaults to `VIRTUAL` when neither keyword is specified in generated column definitions.

### See also

- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %})
- [Computed columns]({% link {{ page.version.version }}/computed-columns.md %})
