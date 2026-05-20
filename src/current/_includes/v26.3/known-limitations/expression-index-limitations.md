- The expression cannot reference columns outside the index's table.
- Functional expression output must be determined by the input arguments. For example, you can't use the [volatile function]({% link {{ page.version.version }}/functions-and-operators.md %}#function-volatility) `now()` to create an index because its output depends on more than just the function arguments.
- CockroachDB does not allow {% if page.name == "expression-indexes.md" %} expression indexes {% else %} [expression indexes]({% link {{ page.version.version }}/expression-indexes.md %}) {% endif %} to reference [computed columns]({% link {{ page.version.version }}/computed-columns.md %}). [#67900](https://github.com/cockroachdb/cockroach/issues/67900)
- CockroachDB does not support expressions as `ON CONFLICT` targets. This means that unique {% if page.name == "expression-indexes.md" %} expression indexes {% else %} [expression indexes]({% link {{ page.version.version }}/expression-indexes.md %}) {% endif %} cannot be selected as arbiters for [`INSERT .. ON CONFLICT`]({% link {{ page.version.version }}/insert.md %}#on-conflict-clause) statements. For example:

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

	[#67893](https://github.com/cockroachdb/cockroach/issues/67893)
