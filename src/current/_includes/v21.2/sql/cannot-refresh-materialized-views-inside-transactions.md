CockroachDB cannot refresh {% if page.name == "views.md" %} materialized views {% else %} [materialized views](views.html#materialized-views) {% endif %} inside [explicit transactions](begin-transaction.html). Trying to refresh a materialized view inside an explicit transaction will result in an error, as shown below.

1. First, start [`cockroach demo`](cockroach-demo.html) with the sample `bank` data set:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach demo bank
    ~~~

2. Create the materialized view described in [Materialized views &#8594; Usage](views.html#usage).

3. Start a new multi-statement transaction with [`BEGIN TRANSACTION`](begin-transaction.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    BEGIN TRANSACTION;
    ~~~

4. Inside the open transaction, attempt to [refresh the view](refresh.html) as shown below. This will result in an error.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    REFRESH MATERIALIZED VIEW overdrawn_accounts;
    ~~~

    ~~~
    ERROR: cannot refresh view in an explicit transaction
    SQLSTATE: 25000
    ~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/66008)
