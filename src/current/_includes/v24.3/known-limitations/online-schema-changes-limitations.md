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