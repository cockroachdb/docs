---
title: TSVECTOR
summary: The TSVECTOR data type stores a list of lexemes, optionally with integer positions and weights, and is used in full-text search.
toc: true
docs_area: reference.sql
---

The `TSVECTOR` [data type](data-types.html) stores a list of lexemes, optionally with integer positions and weights. `TSVECTOR` values are used in [full-text search](full-text-search.html).

## Syntax

A `TSVECTOR` comprises individual lexemes in the form: `'These' 'lexemes' 'are' 'not' 'normalized.'`.

You can optionally add the following to each lexeme:

- Integer positions:

	`'These':1 'lexemes':2 'are':3 'not':4 'normalized.':5`

- One or more weight letters (`A`, `B`, `C`, or `D`), in combination with an integer position:

	`'These':1 'lexemes':2B 'are':3 'not':4 'normalized.':5A`

	If not specified, a lexeme's weight defaults to `D`. For more information about weights, see the [PostgreSQL documentation](https://www.postgresql.org/docs/15/datatype-textsearch.html#DATATYPE-TSVECTOR).

To be usable in [full-text search](full-text-search.html), the lexemes **must be normalized**. You can do this by using the `to_tsvector()` [built-in function](functions-and-operators.html#full-text-search-functions) to convert a string input to `TSVECTOR`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsvector('These lexemes are not normalized.');
~~~

~~~
      to_tsvector
------------------------
  'lexem':2 'normal':5
~~~

Normalization removes the following from the input:

- Suffixes.
- *Stop words*. These are words that are considered not useful for indexing and searching, based on the [text search configuration](full-text-search.html#text-search-configuration). In the preceding example, "These", "are", and "not" are identified as stop words.
- Punctuation and capitalization.
- Duplicates.

In the preceding example, the integer positions indicate that `lexem` and `normal` are the second and fifth lexemes in the input, respectively.

{% comment %}
## PostgreSQL compatibility

`TSVECTOR` values in CockroachDB are fully [PostgreSQL-compatible](https://www.postgresql.org/docs/15/datatype-textsearch.html#DATATYPE-TSVECTOR) for [full-text search](full-text-search.html).
{% endcomment %}

## Examples

For usage examples, see [Full-Text Search](full-text-search.html).

## See also

- [Full-Text Search](full-text-search.html)
- [`TSQUERY`](tsquery.html)
- [Data Types](data-types.html)