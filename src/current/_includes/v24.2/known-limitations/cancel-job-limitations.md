- To avoid transaction states that cannot properly [roll back]({{ page.version.version }}/rollback-transaction.md), the following statements cannot be cancelled with [`CANCEL JOB`]({{ page.version.version }}/cancel-job.md):

	- `DROP` statements (e.g., [`DROP TABLE`]({{ page.version.version }}/drop-table.md)).
	- `ALTER ... RENAME` statements (e.g., [`ALTER TABLE ... RENAME TO`]({{ page.version.version }}/alter-table.md#rename-to)).
	- [`CREATE TABLE ... AS`]({{ page.version.version }}/create-table-as.md) statements.
	- [`ALTER TYPE`]({{ page.version.version }}/alter-type.md) statements, except for those that drop values.

- When an Enterprise [`RESTORE`]({{ page.version.version }}/restore.md) is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.