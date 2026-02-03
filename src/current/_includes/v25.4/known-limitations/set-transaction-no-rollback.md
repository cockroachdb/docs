- {% if page.name == "set-vars.md" %} `SET` {% else %} [`SET`]({% link {{ page.version.version }}/set-vars.md %}) {% endif %} and {% if page.name == "reset-vars.md" %} `RESET` {% else %} [`RESET`]({% link {{ page.version.version }}/reset-vars.md %}) {% endif %} do not properly apply [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}) within a transaction. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET TIME ZONE +2;
    BEGIN;
    SET TIME ZONE +3;
    ROLLBACK;
    SHOW TIME ZONE;
    ~~~

    ~~~sql
      timezone
    ------------
      <+03>-03
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET TIME ZONE +2;
    BEGIN;
    RESET TIME ZONE;
    ROLLBACK;
    SHOW TIME ZONE;
    ~~~

    ~~~sql
      timezone
    ------------
      UTC
    ~~~

    [#69396](https://github.com/cockroachdb/cockroach/issues/69396), [#148766](https://github.com/cockroachdb/cockroach/issues/148766)