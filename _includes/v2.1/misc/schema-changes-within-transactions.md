Within a single [transaction](transactions.html):

- DDL statements cannot be mixed with DML statements. As a workaround, you can split the statements into separate transactions. For more details, [see examples of unsupported statements](online-schema-changes.html#examples-of-statements-that-fail).
- A [`CREATE TABLE`](create-table.html) statement containing [`FOREIGN KEY`](foreign-key.html) or [`INTERLEAVE`](interleave-in-parent.html) clauses cannot be followed by statements that reference the new table.
- A table cannot be dropped and then recreated with the same name. This is not possible within a single transaction because `DROP TABLE` does not immediately drop the name of the table. As a workaround, split the [`DROP TABLE`](drop-table.html) and [`CREATE TABLE`](create-table.html) statements into separate transactions.
