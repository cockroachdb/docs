Within a single [transaction](transactions.html):

- You can run schema changes inside the same transaction as a [`CREATE TABLE`](create-table.html) statement. For more information, see [Run schema changes inside a transaction with `CREATE TABLE`](online-schema-changes.html#run-schema-changes-inside-a-transaction-with-create-table). However, a `CREATE TABLE` statement containing [`FOREIGN KEY`](foreign-key.html) clauses cannot be followed by statements that reference the new table.
- [Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed](#schema-change-ddl-statements-inside-a-multi-statement-transaction-can-fail-while-other-statements-succeed).
- [`DROP COLUMN`](alter-table.html#drop-column) can result in data loss if one of the other schema changes in the transaction fails or is canceled. To work around this, move the `DROP COLUMN` statement to its own explicit transaction or run it in a single statement outside the existing transaction.

{{site.data.alerts.callout_info}}
If a schema change within a transaction fails, manual intervention may be needed to determine which statement has failed. After determining which schema change(s) failed, you can then retry the schema change.
{{site.data.alerts.end}}
