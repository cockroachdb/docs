This playground gives you an interactive SQL shell connected to a single-node CockroachDB cluster running in Docker. It is pre-loaded with a database called `movr`. Run `SHOW TABLES;`{{execute}} for more details.

For the basics of CockroachDB SQL, see [Learn Cockroach SQL](https://www.cockroachlabs.com/docs/stable/learn-cockroachdb-sql.html).

For full documentation on our SQL dialect, see [SQL Reference](https://www.cockroachlabs.com/docs/stable/sql-statements.html).

To get help directly in the SQL shell:
- Run `\h`{{execute}} to see a full list of SQL statements
- Run `\h <statement>` to get help on a specific statement, e.g., `\h SELECT`{{execute}}
- Run `\hf`{{execute}} to see a full list of built-in functions
- Run `\hf <function>` to get help on a specific function, e.g., `\hf gen_random_uuid`{{execute}}
- Run `\?`{{execute}} to see other help options
