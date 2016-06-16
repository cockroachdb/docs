---
title: Keywords & Identifiers
toc: false
---

SQL statements consist of two fundamental components:

- [__Keywords__](#keywords): Words with fixed meanings like `CREATE`, `INDEX`, and `BOOL`
- [__Identifiers__](#identifiers): Names for things like databases and some functions

## Keywords

Keywords make up SQL's vocabulary and have fixed meanings in statements. Each SQL keyword that CockroachDB supports is on one of four lists:

- [__Reserved Keywords__](sql-grammar.html#reserved_keyword): Keywords that could crash SQL if encountered in unexpected places
- [__Type Function Name Keywords__](sql-grammar.html#type_func_name_keyword): Comparison-related keywords like `JOIN` that are not strictly reserved
- [__Column Name Keywords__](sql-grammar.html#col_name_keyword): Value-related keywords like `INT` that are not strictly reserved
- [__Unreserved Keywords__](sql-grammar.html#unreserved_keyword): Keywords not on another list but with meaning in SQL

### Keyword Uses
Most users asking about keywords want to know more about them in terms of:

- __Names of objects__, covered on this page in [Identifiers](#identifiers)
- __Syntax__, covered in our pages [SQL Statements](sql-statements.html) and [SQL Grammar](sql-grammar.html)

## Identifiers

Identifiers are most commonly used as names of objects like databases, tables, or columns&mdash;because of this, the terms "name" and "identifier" are often used interchangeably. However, identifiers also have less-common uses, such as changing column labels with `SELECT`.

### Rules for Identifiers

In our our [SQL grammar](sql-grammar.html), all values that accept an `identifier` must:

- Begin with a Unicode letter or an underscore (_). Subsequent characters can be letters, underscores, digits (0-9), or dollar signs ($).
- Not equal any [SQL keyword](#keywords) unless the keyword is part of a list in the element's syntax.

To bypass either of these rules, simply surround the identifier with double-quotes (&quot;). However, all references to it must also include double-quotes.

{{site.data.alerts.callout_info}}Some statements have additional requirements for identifiers. For example, each table in a database must have a unique name. These requirements are documented on <a href="sql-statements.html">each statement's page</a>.{{site.data.alerts.end}}

## See Also

[Data Definition](data-definition.html)