When using [`cockroach dump`](cockroach-dump.html) to dump the data of a table containing [collations](collate.html), the resulting `INSERT`s do not include the relevant collation clauses. For example:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start-single-node --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE de_names (name STRING COLLATE de PRIMARY KEY);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO de_names VALUES
    ('Backhaus' COLLATE de),
    ('Bär' COLLATE de),
    ('Baz' COLLATE de)
  ;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> q
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach dump defaultdb de_names --insecure > dump.sql
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cat dump.sql
~~~

~~~
CREATE TABLE de_names (
	name STRING COLLATE de NOT NULL,
	CONSTRAINT "primary" PRIMARY KEY (name ASC),
	FAMILY "primary" (name)
);

INSERT INTO de_names (name) VALUES
	('Backhaus'),
	(e'B\u00E4r'),
	('Baz');
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/48278)
