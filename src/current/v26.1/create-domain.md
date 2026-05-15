---
title: sql: add DOMAIN type support
summary: CREATE DOMAIN
toc: true
docs_area: reference
---

## CREATE DOMAIN

```markdown
---
title: CREATE DOMAIN
summary: Create a user-defined domain type based on an existing type with optional constraints.
toc: true
docs_area: reference.sql
---

The `CREATE DOMAIN` statement creates a user-defined domain type, which is a named type based on an existing data type with optional constraints and a default value. Domain types provide PostgreSQL compatibility and allow you to define reusable type definitions with validation rules.

## Required privileges

To create a domain, the user must have the `CREATE` privilege on the database and schema.

## Synopsis

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DOMAIN domain_name AS data_type
  [ DEFAULT default_expr ]
  [ NOT NULL | NULL ]
  [ CHECK ( check_expr ) ]
  [ CONSTRAINT constraint_name CHECK ( check_expr ) ]
~~~

## Parameters

Parameter | Description
----------|------------
`domain_name` | The name of the domain type to create. Must be unique within the schema.
`data_type` | The underlying data type on which the domain is based (e.g., `INT`, `STRING`, `DECIMAL`).
`DEFAULT default_expr` | Optional default expression for the domain. Columns using this domain will inherit this default if no column-specific default is specified.
`NOT NULL` | Adds a NOT NULL constraint to the domain. All values of this domain type must be non-null.
`NULL` | Explicitly allows NULL values (this is the default behavior).
`CHECK ( check_expr )` | Adds an unnamed CHECK constraint to validate domain values.
`CONSTRAINT constraint_name CHECK ( check_expr )` | Adds a named CHECK constraint to validate domain values.

## Examples

### Create a simple domain

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DOMAIN email_address AS STRING;
~~~

### Create a domain with constraints

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DOMAIN positive_integer AS INT 
  CHECK (VALUE > 0);
~~~

### Create a domain with multiple constraints and a default

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DOMAIN product_code AS STRING
  DEFAULT 'PENDING'
  NOT NULL
  CONSTRAINT valid_format CHECK (LENGTH(VALUE) = 8)
  CONSTRAINT valid_prefix CHECK (VALUE ~ '^[A-Z]{2}[0-9]{6}$');
~~~

### Use domain types as column types

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code product_code,  -- Inherits domain constraints and default
  name STRING NOT NULL,
  price DECIMAL(10,2)
);

INSERT INTO products (name, price) VALUES ('Widget', 19.99);
-- The 'code' column will use the domain default 'PENDING'
~~~

## Behavior

- Domain constraints are enforced during `INSERT`, `UPDATE`, and cast operations
- Columns using a domain type inherit the domain's default expression if no column-specific default is specified
- Domain constraints are validated in addition to any column-level constraints
- Domain types can be used anywhere a regular data type can be used

## See also

- [`DROP DOMAIN`]({% link {{ page.version.version }}/drop-domain.md %})
- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %})
```

## DROP DOMAIN

```markdown
---
title: DROP DOMAIN
summary: Remove a user-defined domain type from the database.
toc: true
docs_area: reference.sql
---

The `DROP DOMAIN` statement removes a user-defined domain type from the database. This statement is an extension of the [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %}) statement specifically for domain types.

## Required privileges

To drop a domain, the user must be the owner of the domain or have `DROP` privileges on the domain.

## Synopsis

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DOMAIN [ IF EXISTS ] domain_name [, ...] [ CASCADE | RESTRICT ]
~~~

## Parameters

Parameter | Description
----------|------------
`IF EXISTS` | Drop the domain only if it exists. Do not return an error if the domain does not exist.
`domain_name` | The name of the domain to drop. You can specify multiple domain names separated by commas.
`CASCADE` | Drop the domain and all objects that depend on it (e.g., table columns using the domain type).
`RESTRICT` | Refuse to drop the domain if any objects depend on it. This is the default behavior.

## Examples

### Drop a single domain

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DOMAIN email_address;
~~~

### Drop multiple domains

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DOMAIN product_code, customer_id;
~~~

### Drop a domain only if it exists

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DOMAIN IF EXISTS old_domain;
~~~

### Drop a domain and dependent objects

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DOMAIN product_code CASCADE;
~~~

## Behavior

- By default (`RESTRICT`), the statement fails if any table columns use the domain type
- With `CASCADE`, all dependent objects (table columns, other domains, etc.) are also dropped
- The domain's array type (if it exists) is automatically dropped when the domain is dropped

{{site.data.alerts.callout_danger}}
Using `CASCADE` can drop multiple dependent objects. Review dependencies carefully before using this option.
{{site.data.alerts.end}}

## See also

- [`CREATE DOMAIN`]({% link {{ page.version.version }}/create-domain.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
- [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %})
```

These reference pages provide comprehensive documentation for the new domain type functionality, following the CockroachDB documentation style guide with proper Jekyll formatting, syntax examples, and cross-references to related statements.
