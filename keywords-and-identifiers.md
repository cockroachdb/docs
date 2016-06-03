---
title: Keywords & Identifiers
toc: false
---

SQL statements are made up of two fundamental components:

- [__Keywords__](#keywords) (words with fixed meanings like `CREATE`, `INDEX`, and `BOOL`)
- [__Identifiers__](#identifiers) (names for things like databases and some functions)

## Keywords

Keywords make up SQL's vocabulary and have fixed meanings in statements. Each SQL keyword that CockroachDB supports is on one of four lists:

- [Reserved Keywords](sql-grammar.html#reserved_keyword)
- [Function Name Keywords](sql-grammar.html#type_func_name_keyword)
- [Column Name Keywords](sql-grammar.html#col_name_keyword)
- [Unreserved Keywords](sql-grammar.html#unreserved_keyword)

### Keyword Uses
Most users asking about keywords want to know more about them in terms of:

- __Names of objects__, covered on this page in [Rules for Names of Objects](#rules-for-names-of-objects)
- __Syntax__, covered in our pages [SQL Statements](sql-statements.html) and [SQL Grammar](sql-grammar.html)

## Identifiers

Most commonly, identifiers are names of objects like databases, tables, or columns. More broadly, though, identifiers represent tokens in statements that aren't keywords.

### Rules for Names of Objects

When naming an object, your identifier must:

- Not equal [reserved](sql-grammar.html#reserved_keyword) or [function name](sql-grammar.html#type_func_name_keyword) keywords. 
- Begin with either a letter (a-z, but also letters with diacritical marks and non-Latin letters) or an underscore (_). Subsequent characters can be letters, underscores, digits (0-9), or dollar signs ($).
- Be unique within their contexts. For example, you cannot have two identically named databases in a cluster or two identically named columns in a single table.

To bypass either of the first two rules, simply surround the identifier with double-quotes. However, all references to it must also include double-quotes.

### Rules for All Identifiers

While the most common uses of identifiers are as object names, other elements accept them as well (represented in our [grammar](ql-grammar.html) as `IDENT`). In these contexts, your identifier must:

- Not equal _any_ [SQL keywords](#keywords).
{{site.data.alerts.callout_info}}Some elements that accept <code>IDENT</code> also accept certain keywords, which are included in their syntax. For example, <a href="sql-grammar.html#non_reserved_word"><code>non_reserved_word</code></a> accepts keywords from every list besides <a href="sql-grammar.html#reserved_keyword">reserved keywords</a>.{{site.data.alerts.end}}
- Begin with either a letter (a-z, but also letters with diacritical marks and non-Latin letters) or an underscore (_). Subsequent characters can be letters, underscores, digits (0-9), or dollar signs ($).

You can bypass either of these rules by surrounding the identifier with double-quotes.

`IDENT` values _do not_ necessarily have to be unique in their contexts. If an element requires a unique value, SQL enforces that constraint when executing the statement.

## See Also

[Data Definition](data-definition.html)