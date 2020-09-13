Within a single [transaction](transactions.html):

- DDL statements cannot be mixed with DML statements. As a workaround, you can split the statements into separate transactions. For more details, [see examples of unsupported statements](online-schema-changes.html#examples-of-statements-that-fail).
- A [`CREATE TABLE`](create-table.html) statement containing [`FOREIGN KEY`](foreign-key.html) or [`INTERLEAVE`](interleave-in-parent.html) clauses cannot be followed by statements that reference the new table.
- A table cannot be dropped and then recreated with the same name. This is not possible within a single transaction because `DROP TABLE` does not immediately drop the name of the table. As a workaround, split the [`DROP TABLE`](drop-table.html) and [`CREATE TABLE`](create-table.html) statements into separate transactions.
- [Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed](#schema-change-ddl-statements-inside-a-multi-statement-transaction-can-fail-while-other-statements-succeed)

{{site.data.alerts.callout_success}}
As of version v2.1, you can run schema changes inside the same transaction as a `CREATE TABLE` statement. For more information, [see this example](online-schema-changes.html#run-schema-changes-inside-a-transaction-with-create-table). Also, as of v19.1, some schema changes can be used in combination in a single `ALTER TABLE` statement. For a list of commands that can be combined, see [`ALTER TABLE`](alter-table.html). For a demonstration, see [Add and rename columns atomically](rename-column.html#add-and-rename-columns-atomically).
{{site.data.alerts.end}}
