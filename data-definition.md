---
title: Data Definition
toc: true
---

## Identifiers

When naming a database, table, column, or other object, the identifier you use must follow these rules:

- Must begin with a letter (a-z, but also letters with diacritical marks and non-Latin letters) or an underscore (_). Subsequent characters can be letters, underscores, digits (0-9), or dollar signs ($).
- Must not be a [reserved keyword](#reserved-keywords). This rule does not apply to column names.
- Must be unique within its context. For example, you cannot have two identically-named databases in a cluster or two identically-named columns in a single table. 

To bypass either of the first two rules, simply surround the identifier with double-quotes.

### Reserved Keywords

- ALL
- ANALYSE
- ANALYZE
- AND
- ANY
- ARRAY
- AS
- ASC
- ASYMMETRIC
- BOTH
- CASE
- CAST
- CHECK
- COLLATE
- COLUMN
- CONSTRAINT
- CREATE
- CURRENT_CATALOG
- CURRENT_DATE
- CURRENT_ROLE
- CURRENT_TIME
- CURRENT_TIMESTAMP
- CURRENT_USER
- DEFAULT
- DEFERRABLE
- DESC
- DISTINCT
- DO
- ELSE
- END
- EXCEPT
- FALSE
- FETCH
- FOR
- FOREIGN
- FROM
- GRANT
- GROUP
- HAVING
- IN
- INDEX
- INITIALLY
- INTERSECT
- INTO
- LATERAL
- LEADING
- LIMIT
- LOCALTIME
- LOCALTIMESTAMP
- NOT
- NULL
- OFFSET
- ON
- ONLY
- OR
- ORDER
- PLACING
- PRIMARY
- REFERENCES
- RETURNING
- SELECT
- SESSION_USER
- SOME
- SYMMETRIC
- TABLE
- THEN
- TO
- TRAILING
- TRUE
- UNION
- UNIQUE
- USER
- USING
- VARIADIC
- WHEN
- WHERE
- WINDOW
- WITH

## Default Values

Coming soon.

## Constraints

Coming soon.

## Privileges

Coming soon.

## Indexes

Coming soon.