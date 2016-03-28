---
title: STRING
toc: true
---

## Description

The `STRING` [data type](data-types.html) stores strings of variable length. 

## Synonyms 

In CockroachDB, the following are synonyms of `STRING`: 

- `CHAR` 
- `CHAR(n)` 
- `VARCHAR`
- `VARCHAR(n)` 
- `TEXT`

## Length

At this time, length is always variable for a `STRING` value. If you specify a fixed length by declaring `CHAR(n)` or `VARCHAR(n)` on a column, it will not be enforced.

{{site.data.alerts.callout_info}}A future version of CockroachDB will support enforcing length limits on strings.{{site.data.alerts.end}}

## Format

When declaring a `STRING`, format it as `'a1b2c3'`.

## Examples

~~~
CREATE TABLE strings (a STRING PRIMARY KEY, b CHAR, c TEXT);

SHOW COLUMNS FROM strings;
+-------+--------+-------+---------+
| Field |  Type  | Null  | Default |
+-------+--------+-------+---------+
| a     | STRING | false | NULL    |
| b     | STRING | true  | NULL    |
| c     | STRING | true  | NULL    |
+-------+--------+-------+---------+

INSERT INTO strings VALUES ('a1b2c3', 'd4e5f6', 'g7h8i9');

SELECT * FROM strings;
+--------+--------+--------+
|   a    |   b    |   c    |
+--------+--------+--------+
| a1b2c3 | d4e5f6 | g7h8i9 |
+--------+--------+--------+
~~~

## See Also

[Data Types](data-types.html)