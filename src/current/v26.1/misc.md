---
title: sql: add DOMAIN type support
summary: CREATE DOMAIN
toc: true
docs_area: reference.sql
---

# CREATE DOMAIN

**Synopsis**: 
```sql
CREATE DOMAIN domain_name AS data_type
    [ DEFAULT expression ]
    [ constraint [ constraint ... ] ]

Where constraint is:
    [ CONSTRAINT constraint_name ] CHECK ( expression )
  | [ CONSTRAINT constraint_name ] NOT NULL
  | NULL
```

**Description**: Creates a new domain type. A domain is a user-defined data type that is based on another underlying data type (called the base type). Domains can include optional constraints such as NOT NULL constraints, CHECK constraints, and default values. Domains are useful for creating reusable column definitions with built-in validation rules.

**Parameters**:
| Parameter | Description | Required |
|-----------|-------------|----------|
| `domain_name` | Name of the domain to create | Yes |
| `data_type` | The underlying base data type for the domain | Yes |
| `DEFAULT expression` | Default value expression for the domain | No |
| `CHECK ( expression )` | CHECK constraint expression that must evaluate to true. Use `VALUE` to reference the domain value in the expression | No |
| `NOT NULL` | Specifies that the domain cannot contain NULL values | No |
| `NULL` | Explicitly allows NULL values (default behavior) | No |
| `CONSTRAINT constraint_name` | Optional name for the constraint | No |

**Required Privileges**: 
- `CREATE` privilege on the database
- `CREATE` privilege on the schema where the domain will be created
- `USAGE` privilege on the base data type (if it's a user-defined type)

**Examples**:

Create a simple domain based on VARCHAR:
```sql
CREATE DOMAIN email_address AS VARCHAR(255);
```

Create a domain with a CHECK constraint:
```sql
CREATE DOMAIN positive_integer AS INTEGER 
    CHECK (VALUE > 0);
```

Create a domain with multiple constraints and a default:
```sql
CREATE DOMAIN product_code AS VARCHAR(10)
    DEFAULT 'UNKNOWN'
    NOT NULL
    CHECK (LENGTH(VALUE) >= 3)
    CHECK (VALUE ~ '^[A-Z0-9]+$');
```

Create a domain with named constraints:
```sql
CREATE DOMAIN price AS DECIMAL(10,2)
    DEFAULT 0.00
    CONSTRAINT price_not_null NOT NULL
    CONSTRAINT price_positive CHECK (VALUE >= 0);
```

Use a domain in a table definition:
```sql
CREATE DOMAIN user_id AS INTEGER CHECK (VALUE > 0);

CREATE TABLE users (
    id user_id PRIMARY KEY,
    email email_address UNIQUE,
    account_balance price
);
```

**Notes**:
- Domain names must be unique within their schema
- CHECK constraints in domains can reference the domain value using the keyword `VALUE`
- Domains cannot be created based on other domains (domain-of-domain is not supported)
- When a domain is created, a corresponding array type is automatically created
- All cluster nodes must be upgraded to version 26.3 or later to use CREATE DOMAIN

# DROP DOMAIN

**Synopsis**: 
```sql
DROP DOMAIN [ IF EXISTS ] domain_name [, ...] [ CASCADE | RESTRICT ]
```

**Description**: Removes one or more domain types from the database. When a domain is dropped, its associated array type is also automatically dropped.

**Parameters**:
| Parameter | Description | Required |
|-----------|-------------|----------|
| `domain_name` | Name of the domain to drop | Yes |
| `IF EXISTS` | Do not throw an error if the domain does not exist | No |
| `CASCADE` | Automatically drop objects that depend on the domain | No |
| `RESTRICT` | Refuse to drop if any objects depend on the domain (default behavior) | No |

**Required Privileges**: 
- `DROP` privilege on the domain

**Examples**:

Drop a single domain:
```sql
DROP DOMAIN email_address;
```

Drop multiple domains:
```sql
DROP DOMAIN email_address, product_code, price;
```

Drop a domain only if it exists:
```sql
DROP DOMAIN IF EXISTS old_domain_name;
```

Drop a domain and all dependent objects:
```sql
DROP DOMAIN user_status CASCADE;
```

**Notes**:
- By default, DROP DOMAIN will fail if there are any columns using the domain type. Use CASCADE to automatically drop dependent columns
- The domain's companion array type is automatically dropped along with the domain
- IF EXISTS prevents errors when the domain doesn't exist, making the statement idempotent
