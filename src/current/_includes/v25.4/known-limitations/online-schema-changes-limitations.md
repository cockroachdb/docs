##### Schema changes within transactions

Most schema changes should not be performed within an explicit transaction with multiple statements, as they do not have the same atomicity guarantees as other SQL statements. Execute schema changes either as single statements (as an implicit transaction), or in an explicit transaction consisting of the single schema change statement. There are some exceptions to this, detailed below.

Schema changes keep your data consistent at all times, but they do not run inside [transactions][txns] in the general case. Making schema changes transactional would mean requiring a given schema change to propagate across all the nodes of a cluster. This would block all user-initiated transactions being run by your application, since the schema change would have to commit before any other transactions could make progress. This would prevent the cluster from servicing reads and writes during the schema change, requiring application downtime.

{{site.data.alerts.callout_success}}
Some tools and applications may be able to workaround CockroachDB's lack of transactional schema changes by [enabling a setting that automatically commits before running schema changes inside transactions]({% link {{ page.version.version }}/online-schema-changes.md %}#enable-automatic-commit-before-running-schema-changes-inside-transactions).
{{site.data.alerts.end}}

Some schema change operations can be run within explicit, multiple statement transactions. `CREATE TABLE` and `CREATE INDEX` statements can be run within the same transaction with the same atomicity guarantees as other SQL statements. There are no performance or rollback issues when using these statements within a multiple statement transaction.

{% include {{ page.version.version }}/known-limitations/schema-changes-within-transactions.md %}

##### Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed

{% include {{ page.version.version }}/known-limitations/schema-change-ddl-inside-multi-statement-transactions.md %}

##### No online schema changes if primary key change in progress

You cannot start an online schema change on a table if a [primary key change]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key) is currently in progress on the same table.

##### No online schema changes between executions of prepared statements

{% include {{ page.version.version }}/known-limitations/schema-changes-between-prepared-statements.md %}

##### Column-dropping schema changes may not roll back properly

Some [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}) that [drop columns]({% link {{ page.version.version }}/alter-table.md %}#drop-column) cannot be [rolled back]({% link {{ page.version.version }}/rollback-transaction.md %}) properly.

In some cases, the rollback will succeed, but the column data might be partially or totally missing, or stale due to the asynchronous nature of the schema change. [#46541](https://github.com/cockroachdb/cockroach/issues/46541)

In other cases, the rollback will fail in such a way that will never be cleaned up properly, leaving the table descriptor in a state where no other schema changes can be run successfully. [#47712](https://github.com/cockroachdb/cockroach/issues/47712)

To reduce the chance that a column drop will roll back incorrectly:

- Perform column drops in transactions separate from other schema changes. This ensures that other schema change failures will not cause the column drop to be rolled back.
- Drop all [constraints]({% link {{ page.version.version }}/constraints.md %}) (including [unique indexes]({% link {{ page.version.version }}/unique.md %})) on the column in a separate transaction, before dropping the column.
- Drop any [default values]({% link {{ page.version.version }}/default-value.md %}) or [computed expressions]({% link {{ page.version.version }}/computed-columns.md %}) on a column before attempting to drop the column. This prevents conflicts between constraints and default/computed values during a column drop rollback.

If you think a rollback of a column-dropping schema change has occurred, check the [jobs table]({% link {{ page.version.version }}/show-jobs.md %}). Schema changes with an error prefaced by `cannot be reverted, manual cleanup may be required` might require manual intervention.