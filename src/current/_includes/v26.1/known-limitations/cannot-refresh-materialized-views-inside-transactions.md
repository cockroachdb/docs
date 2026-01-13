- CockroachDB cannot refresh {% if page.name == "views.md" %} materialized views {% else %} [materialized views]({% link {{ page.version.version }}/views.md %}#materialized-views) {% endif %} inside [explicit transactions]({% link {{ page.version.version }}/begin-transaction.md %}). Trying to refresh a materialized view inside an explicit transaction will result in an error.
    1. Start [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) with the sample `bank` data set:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        cockroach demo bank
        ~~~
    1. Create the materialized view described in [Usage]({% link {{ page.version.version }}/views.md %}#usage).
    1. Start a new multi-statement transaction with [`BEGIN TRANSACTION`]({% link {{ page.version.version }}/begin-transaction.md %}):

          {% include_cached copy-clipboard.html %}
          ~~~ sql
          BEGIN TRANSACTION;
          ~~~
    1. Inside the open transaction, attempt to [refresh the view]({% link {{ page.version.version }}/refresh.md %}). This will result in an error.

          {% include_cached copy-clipboard.html %}
          ~~~ sql
          REFRESH MATERIALIZED VIEW overdrawn_accounts;
          ~~~

          ~~~
          ERROR: cannot refresh view in an explicit transaction
          SQLSTATE: 25000
          ~~~

    [#66008](https://github.com/cockroachdb/cockroach/issues/66008)
