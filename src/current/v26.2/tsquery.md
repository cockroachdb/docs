---
title: TSQUERY
summary: The TSQUERY data type a list of lexemes separated by operators, and is used in full-text search.
toc: true
docs_area: reference.sql
---

The `TSQUERY` [data type]({% link {{ page.version.version }}/data-types.md %}) stores a list of lexemes separated by operators. `TSQUERY` values are used in [full-text search]({% link {{ page.version.version }}/full-text-search.md %}).

## Syntax

A `TSQUERY` comprises individual lexemes and operators in the form: `'These' & 'lexemes' & 'are' & 'not' & 'normalized' & 'lexemes.'`.

The operators in a `TSQUERY` are used to [match a `TSQUERY` to a `TSVECTOR`]({% link {{ page.version.version }}/full-text-search.md %}#match-queries-to-documents). Valid `TSQUERY` operators are:

- `&` (AND). Given `'one' & 'two'`, both `one` and `two` must be present in the matching `TSVECTOR`.
- `|` (OR). Given `'one' | 'two'`, either `one` or `two` must be present in the matching `TSVECTOR`.
- `!` (NOT). Given `'one' & ! 'two'`, `one` must be present and `two` must **not** be present in the matching `TSVECTOR`.
- `<->` (FOLLOWED BY). Given `'one' <-> 'two'`, `one` must be followed by `two` in the matching `TSVECTOR`.
	- `<->` is equivalent to `<1>`. You can specify an integer `<n>` to indicate that lexemes must be separated by `n-1` other lexemes. Given `'one' <4> 'two'`, `one` must be followed by three lexemes and then followed by `two` in the matching `TSVECTOR`.

You can optionally add the following to each lexeme:

- One or more weight letters (`A`, `B`, `C`, or `D`): 

	`'These' & 'lexemes':B & 'are' & 'not' & 'normalized':A & 'lexemes':B`

	If not specified, a lexeme's weight defaults to `D`. It is only necessary to specify weights in a `TSQUERY` if they are also [specified in a `TSVECTOR`]({% link {{ page.version.version }}/tsvector.md %}#syntax) to be used in a comparison. The lexemes in a `TSQUERY` and `TSVECTOR` will only match if they have matching weights. For more information about weights, see the [PostgreSQL documentation](https://www.postgresql.org/docs/15/datatype-textsearch.html#DATATYPE-TSQUERY).

To be usable in [full-text search]({% link {{ page.version.version }}/full-text-search.md %}), the lexemes **must be normalized**. You can do this by using the `to_tsquery()`, `plainto_tsquery()`, or `phraseto_tsquery()` [built-in functions]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) to convert a string input to `TSQUERY`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsquery('These & lexemes & are & not & normalized & lexemes.');
~~~

~~~
           to_tsquery
--------------------------------
  'lexem' & 'normal' & 'lexem'
~~~

Normalization removes the following from the input:

- Derivatives of words, which are reduced using a [stemming](https://wikipedia.org/wiki/Stemming) algorithm. 
- *Stop words*. These are words that are considered not useful for indexing and searching, based on the [text search configuration]({% link {{ page.version.version }}/full-text-search.md %}#text-search-configuration). In the preceding example, "These", "are", and "not" are identified as stop words.
- Punctuation and capitalization.

{% comment %}
## PostgreSQL compatibility

`TSQUERY` values in CockroachDB are fully [PostgreSQL-compatible](https://www.postgresql.org/docs/15/datatype-textsearch.html#DATATYPE-TSQUERY) for [full-text search]({% link {{ page.version.version }}/full-text-search.md %}).
{% endcomment %}

## Examples

For usage examples, see [Full-Text Search]({% link {{ page.version.version }}/full-text-search.md %}).

## See also

- [Full-Text Search]({% link {{ page.version.version }}/full-text-search.md %})
- [`TSVECTOR`]({% link {{ page.version.version }}/tsvector.md %})
- [Data Types]({% link {{ page.version.version }}/data-types.md %})