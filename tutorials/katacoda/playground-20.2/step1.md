This playground gives you an interactive SQL shell to a temporary, single-node CockroachDB cluster running v20.2. The cluster is pre-loaded with a sample dataset and configured for CockroachDB's [spatial](https://www.cockroachlabs.com/docs/v20.2/spatial-features.html) functionality.

For the basics of CockroachDB SQL, see [Learn Cockroach SQL](https://www.cockroachlabs.com/docs/stable/learn-cockroachdb-sql.html).

For full documentation on our SQL dialect, see [SQL Reference](https://www.cockroachlabs.com/docs/stable/sql-statements.html).

To get help directly in the SQL shell:
- Run `\h`{{execute}} to see a full list of SQL statements
- Run `\h <statement>` to get help on a specific statement, e.g., `\h SELECT`{{execute}}
- Run `\hf`{{execute}} to see a full list of built-in functions
- Run `\hf <function>` to get help on a specific function, e.g., `\hf gen_random_uuid`{{execute}}
- Run `\?`{{execute}} to see other help options
