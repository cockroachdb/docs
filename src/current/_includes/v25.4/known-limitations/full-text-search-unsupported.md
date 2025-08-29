- Aspects of [text search configurations]({% link {{ page.version.version }}/full-text-search.md %}#text-search-configuration) other than the specified dictionary.
- `websearch_to_tsquery()` built-in function.
- `tsquery_phrase()` built-in function.
- `ts_rank_cd()` built-in function.
- `setweight()` built-in function.
- Inverted joins on `TSVECTOR` values.
- `tsvector || tsvector` comparisons.
- `tsquery || tsquery` comparisons.
- `tsquery && tsquery` comparisons.
- `tsquery <-> tsquery` comparisons.
- `!! tsquery` comparisons.
- `tsquery @> tsquery` and `tsquery <@ tsquery` comparisons.

[#41288](https://github.com/cockroachdb/cockroach/issues/41288)