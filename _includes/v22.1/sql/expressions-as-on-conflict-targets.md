CockroachDB does not support expressions as `ON CONFLICT` targets. This means that unique {% if page.name == "expression-indexes.md" %} expression indexes {% else %} [expression indexes](expression-indexes.html) {% endif %} cannot be selected as arbiters for [`INSERT .. ON CONFLICT`](insert.html#on-conflict-clause) statements. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE t (a INT, b INT, UNIQUE INDEX ((a + b)));
    ~~~

    ~~~
    CREATE TABLE
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO t VALUES (1, 2) ON CONFLICT ((a + b)) DO NOTHING;
    ~~~

    ~~~
    invalid syntax: statement ignored: at or near "(": syntax error
    SQLSTATE: 42601
    DETAIL: source SQL:
    INSERT INTO t VALUES (1, 2) ON CONFLICT ((a + b)) DO NOTHING
                                        ^
    HINT: try \h INSERT
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO t VALUES (1, 2) ON CONFLICT ((a + b)) DO UPDATE SET a = 10;
    ~~~

    ~~~
    invalid syntax: statement ignored: at or near "(": syntax error
    SQLSTATE: 42601
    DETAIL: source SQL:
    INSERT INTO t VALUES (1, 2) ON CONFLICT ((a + b)) DO UPDATE SET a = 10
                                        ^
    HINT: try \h INSERT
    ~~~

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/67893)
