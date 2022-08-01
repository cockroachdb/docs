Within a single [transaction](transactions.html):

- As of version v2.1, you can run schema changes inside the same transaction as a [`CREATE TABLE`](create-table.html) statement. For more information, [see this example](online-schema-changes.html#run-schema-changes-inside-a-transaction-with-create-table).
- A `CREATE TABLE` statement containing [`FOREIGN KEY`](foreign-key.html) clauses cannot be followed by statements that reference the new table.
- [Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed](#schema-change-ddl-statements-inside-a-multi-statement-transaction-can-fail-while-other-statements-succeed).
- As of v19.1, some schema changes can be used in combination in a single `ALTER TABLE` statement. For a list of commands that can be combined, see [`ALTER TABLE`](alter-table.html). For a demonstration, see [Add and rename columns atomically](rename-column.html#add-and-rename-columns-atomically).
- [`DROP COLUMN`](drop-column.html) can result in data loss if one of the other schema changes in the transaction fails or is canceled. To work around this, move the `DROP COLUMN` statement to its own explicit transaction or run it in a single statement outside the existing transaction.

{{site.data.alerts.callout_info}}
If a schema change within a transaction fails, manual intervention may be needed to determine which has failed. After determining which schema change(s) failed, you can then retry the schema changes.
{{site.data.alerts.end}}
