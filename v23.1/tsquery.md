---
title: TSQUERY
summary: The TSQUERY data type a list of lexemes separated by operators, and is used in full-text search.
toc: true
docs_area: reference.sql
---

The `TSQUERY` [data type](data-types.html) stores a list of lexemes separated by operators. `TSQUERY` values are used in [full-text search](full-text-search.html).

## Syntax

A `TSQUERY` comprises individual lexemes and operators in the form: `'These' & 'lexemes' & 'are' & 'not' & 'normalized.'`.

The operators in a `TSQUERY` are used to [match a `TSQUERY` to a `TSVECTOR`](full-text-search.html#match-queries-to-documents). Valid `TSQUERY` operators are:

- `&` (AND)
- `|` (OR)
- `!` (NOT)
- `<->` (FOLLOWED BY)

You can optionally add the following to each lexeme:

- One or more weight letters (`A`, `B`, `C`, or `D`): 

	`'These' & 'lexemes':B & 'are' & 'not' & 'normalized.':A`

	If not specified, a lexeme's weight defaults to `D`. For more information about weights, see the [PostgreSQL documentation](https://www.postgresql.org/docs/15/datatype-textsearch.html#DATATYPE-TSQUERY).

To be usable in [full-text search](full-text-search.html), the lexemes **must be normalized**. You can do this by using the `to_tsquery()`, `plainto_tsquery()`, or `phraseto_tsquery()` [built-in functions](functions-and-operators.html#full-text-search-functions) to convert a string input to `TSQUERY`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsquery('These & lexemes & are & not & normalized.');
~~~

~~~
      to_tsquery
----------------------
  'lexem' & 'normal'
~~~

Normalization removes the following from the input:

- Suffixes.
- *Stop words*. These are words that are considered not useful for indexing and searching, based on the [text search configuration](full-text-search.html#text-search-configuration). In the preceding example, "These", "are", and "not" are identified as stop words.
- Punctuation and capitalization.
- Duplicates.

{% comment %}
## PostgreSQL compatibility

`TSQUERY` values in CockroachDB are fully [PostgreSQL-compatible](https://www.postgresql.org/docs/15/datatype-textsearch.html#DATATYPE-TSQUERY) for [full-text search](full-text-search.html).
{% endcomment %}

## Examples

For usage examples, see [Full-Text Search](full-text-search.html).

## See also

- [Full-Text Search](full-text-search.html)
- [`TSVECTOR`](tsvector.html)
- [Data Types](data-types.html)