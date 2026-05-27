- To prevent the optimizer from planning a full scan for a specific table, specify the `NO_FULL_SCAN` index hint. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM table_name@{NO_FULL_SCAN};
    ~~~

- To prevent a full scan of a [partial index]({% link {{ page.version.version }}/partial-indexes.md %}) for a specific table, you must specify `NO_FULL_SCAN` in combination with the index name using [`FORCE_INDEX`]({% link {{ page.version.version }}/table-expressions.md %}#force-index-selection). For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM table_name@{FORCE_INDEX=index_name,NO_FULL_SCAN} WHERE b > 0;
    ~~~

    This forces a constrained scan of the partial index. If a constrained scan of the partial index is not possible, an error is returned.