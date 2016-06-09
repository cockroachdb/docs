---
title: Identifiers
toc: false
---

When naming a database, table, column, or other object, the identifier you use must follow these rules:

1. Must begin with a UNICODE letter or an underscore (_). Subsequent characters can be letters, underscores, digits (0-9), or dollar signs ($).
2. Must not be a [reserved keyword](sql-grammar.html#reserved_keyword). This rule does not apply to column names.
3. Must be unique within its context. For example, you cannot have two identically-named databases in a cluster or two identically-named columns in a single table. 

To include characters not permitted by the first two rules, simply surround the identifier with double quotes.

## See Also

[Data Definition](data-definition.html)