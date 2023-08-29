CockroachDB does not allow {% if page.name == "expression-indexes.md" %} expression indexes {% else %} [expression indexes]({% link {{ page.version.version }}/expression-indexes.md %}) {% endif %} to reference [computed columns]({% link {{ page.version.version }}/computed-columns.md %}).

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/67900)
