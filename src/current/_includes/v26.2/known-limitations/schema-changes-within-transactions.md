Within a single [transaction]({% link {{ page.version.version }}/transactions.md %}):

- You can run schema changes inside the same transaction as a [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) statement. For more information, see [Run schema changes inside a transaction with `CREATE TABLE`]({% link {{ page.version.version }}/online-schema-changes.md %}#run-schema-changes-inside-a-transaction-with-create-table). However, a `CREATE TABLE` statement containing [`FOREIGN KEY`]({% link {{ page.version.version }}/foreign-key.md %}) clauses cannot be followed by statements that reference the new table.
- [Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed](#schema-change-ddl-statements-inside-a-multi-statement-transaction-can-fail-while-other-statements-succeed).
- [`DROP COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#drop-column) can result in data loss if one of the other schema changes in the transaction fails or is canceled. To work around this, move the `DROP COLUMN` statement to its own explicit transaction or run it in a single statement outside the existing transaction.

{{site.data.alerts.callout_info}}
If a schema change within a transaction fails, manual intervention may be needed to determine which statement has failed. After determining which schema change(s) failed, you can then retry the schema change.
{{site.data.alerts.end}}
