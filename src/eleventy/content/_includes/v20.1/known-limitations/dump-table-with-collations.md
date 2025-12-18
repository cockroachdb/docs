When using [`cockroach dump`](cockroach-dump.html) to dump the data of a table containing [collations](collate.html), the resulting `INSERT`s do not include the relevant collation clauses. For example:

~~~ shell
$ cockroach start-single-node --insecure
~~~

~~~ shell
$ cockroach sql --insecure
~~~

~~~ sql
> CREATE TABLE de_names (name STRING COLLATE de PRIMARY KEY);
~~~

~~~ sql
> INSERT INTO de_names VALUES
    ('Backhaus' COLLATE de),
    ('Bär' COLLATE de),
    ('Baz' COLLATE de)
  ;
~~~

~~~ sql
> q
~~~

~~~ shell
$ cockroach dump defaultdb de_names --insecure > dump.sql
~~~

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
