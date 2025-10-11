The following {% if page.name == "plpgsql.md" %}[user-defined function]({% link {{ page.version.version }}/user-defined-functions.md %}){% else %}user-defined function{% endif %} returns the `n`th integer in the Fibonacci sequence.

It uses the {% if page.name == "plpgsql.md" %}PL/pgSQL{% else %}[PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}){% endif %} [`LOOP`]({% link {{ page.version.version }}/plpgsql.md %}#write-loops) syntax to iterate through a simple calculation, and [`RAISE EXCEPTION`]({% link {{ page.version.version }}/plpgsql.md %}#report-messages-and-handle-exceptions) to return an error message if the specified `n` is negative.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE FUNCTION fib(n int) RETURNS INT AS $$
	DECLARE
		tmp INT;
		a INT := 0;
		b INT := 1;
		i INT := 2;
	BEGIN
		IF n < 0 THEN
			RAISE EXCEPTION 'n must be non-negative';
		END IF;
		IF n = 0 THEN RETURN 0; END IF;
		IF n = 1 THEN RETURN 1; END IF;
		LOOP
			IF i > n THEN EXIT; END IF;
			tmp := a + b;
			a := b;
			b := tmp;
			i := i + 1;
		END LOOP;
		RETURN b;
	END
  $$ LANGUAGE PLpgSQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT fib(8);
~~~

~~~
  fib
-------
   21
~~~
