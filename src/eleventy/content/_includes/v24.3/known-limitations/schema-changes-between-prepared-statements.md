When the schema of a table targeted by a prepared statement changes after the prepared statement is created, future executions of the prepared statement could result in an error. For example, adding a column to a table referenced in a prepared statement with a `SELECT *` clause will result in an error:

~~~ sql
CREATE TABLE users (id INT PRIMARY KEY);
~~~

~~~ sql
PREPARE prep1 AS SELECT * FROM users;
~~~

~~~ sql
ALTER TABLE users ADD COLUMN name STRING;
~~~

~~~ sql
INSERT INTO users VALUES (1, 'Max Roach');
~~~

~~~ sql
EXECUTE prep1;
~~~

~~~
ERROR: cached plan must not change result type
SQLSTATE: 0A000
~~~

It's therefore recommended to explicitly list result columns instead of using `SELECT *` in prepared statements, when possible.
