---
title: TSVECTOR
summary: The TSVECTOR data type stores a list of lexemes, optionally with integer positions and weights, and is used in full-text search.
toc: true
docs_area: reference.sql
---

The `TSVECTOR` [data type]({% link {{ page.version.version }}/data-types.md %}) stores a list of lexemes, optionally with integer positions and weights. `TSVECTOR` values are used in [full-text search]({% link {{ page.version.version }}/full-text-search.md %}).

## Syntax

A `TSVECTOR` comprises individual lexemes in the form: `'These' 'lexemes' 'are' 'not' 'normalized' 'lexemes.'`.

You can optionally add the following to each lexeme:

- One or more comma-separated integer positions:

	`'These':1 'lexemes':2 'are':3 'not':4 'normalized':5 'lexemes.':6`

- A weight letter (`A`, `B`, `C`, or `D`), in combination with an integer position:

	`'These':1 'lexemes':2B 'are':3 'not':4 'normalized':5A 'lexemes.':6B`

	If not specified, a lexeme's weight defaults to `D`. The lexemes in a `TSQUERY` and `TSVECTOR` will only match if they have matching weights. For more information about weights, see the [PostgreSQL documentation](https://www.postgresql.org/docs/15/datatype-textsearch.html#DATATYPE-TSVECTOR).

To be usable in [full-text search]({% link {{ page.version.version }}/full-text-search.md %}), the lexemes **must be normalized**. You can do this by using the `to_tsvector()` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) to convert a string input to `TSVECTOR`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsvector('These lexemes are not normalized lexemes.');
~~~

~~~
       to_tsvector
--------------------------
  'lexem':2,6 'normal':5
~~~

Normalization removes the following from the input:

- Derivatives of words, which are reduced using a [stemming](https://wikipedia.org/wiki/Stemming) algorithm. 
- *Stop words*. These are words that are considered not useful for indexing and searching, based on the [text search configuration]({% link {{ page.version.version }}/full-text-search.md %}#text-search-configuration). In the preceding example, "These", "are", and "not" are identified as stop words.
- Punctuation and capitalization.

In the preceding output, the integers indicate that `normal` is in the fifth position and `lexem` is in both the second and sixth position in the input.

{% comment %}
## PostgreSQL compatibility

`TSVECTOR` values in CockroachDB are fully [PostgreSQL-compatible](https://www.postgresql.org/docs/15/datatype-textsearch.html#DATATYPE-TSVECTOR) for [full-text search]({% link {{ page.version.version }}/full-text-search.md %}).
{% endcomment %}

## Examples

For usage examples, see [Full-Text Search]({% link {{ page.version.version }}/full-text-search.md %}).

## See also

- [Full-Text Search]({% link {{ page.version.version }}/full-text-search.md %})
- [`TSQUERY`]({% link {{ page.version.version }}/tsquery.md %})
- [Data Types]({% link {{ page.version.version }}/data-types.md %})