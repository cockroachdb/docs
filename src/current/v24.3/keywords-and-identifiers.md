---
title: Keywords & Identifiers
summary: Learn about SQL keywords and identifiers in CockroachDB.
toc: true
docs_area: reference.sql
---

SQL statements consist of two fundamental components:

- [__Keywords__](#keywords): Words with specific meaning in SQL like `CREATE`, `INDEX`, and `BOOL`
- [__Identifiers__](#identifiers): Names for things like databases and some functions

## Keywords

Keywords make up SQL's vocabulary and can have specific meaning in statements. Each SQL keyword that CockroachDB supports is on one of four lists:

- [Reserved Keywords]({% link {{ page.version.version }}/sql-grammar.md %}#reserved_keyword)
- [Type Function Name Keywords]({% link {{ page.version.version }}/sql-grammar.md %}#type_func_name_keyword)
- [Column Name Keywords]({% link {{ page.version.version }}/sql-grammar.md %}#col_name_keyword)
- [Unreserved Keywords]({% link {{ page.version.version }}/sql-grammar.md %}#unreserved_keyword)

Reserved keywords have fixed meanings and are not typically allowed as identifiers. All other types of keywords are considered non-reserved; they have special meanings in certain contexts and can be used as identifiers in other contexts.

### Keyword uses

Most users asking about keywords want to know more about them in terms of:

- __Names of objects__, covered on this page in [Identifiers](#identifiers)
- __Syntax__, covered in our pages [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %}) and [SQL Grammar]({% link {{ page.version.version }}/sql-grammar.md %})

## Identifiers

Identifiers are most commonly used as names of objects like databases, tables, or columns&mdash;because of this, the terms "name" and "identifier" are often used interchangeably. However, identifiers also have less-common uses, such as changing column labels with `SELECT`.

### Rules for Identifiers

In our [SQL grammar]({% link {{ page.version.version }}/sql-grammar.md %}), all values that accept an `identifier` must:

- Begin with a Unicode letter or an underscore (_). Subsequent characters can be letters, underscores, digits (0-9), or dollar signs ($).
- Not equal any [SQL keyword](#keywords) unless the keyword is accepted by the element's syntax. For example, [`name`]({% link {{ page.version.version }}/sql-grammar.md %}#name) accepts Unreserved or Column Name keywords.

To bypass either of these rules, simply surround the identifier with double-quotes (&quot;). You can also use double-quotes to preserve case-sensitivity in database, table, view, and column names. However, all references to such identifiers must also include double-quotes.

{{site.data.alerts.callout_info}}Some statements have additional requirements for identifiers. For example, each table in a database must have a unique name. These requirements are documented on <a href="{% link {{ page.version.version }}/sql-statements.md %}">each statement's page</a>.{{site.data.alerts.end}}

## See also

- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Full SQL Grammar]({% link {{ page.version.version }}/sql-grammar.md %})
- [SQL Name Resolution]({% link {{ page.version.version }}/sql-name-resolution.md %})
