Review the [limitations of online schema changes](online-schema-changes.html#limitations). CockroachDB [doesn't guarantee the atomicity of schema changes within transactions with multiple statements](online-schema-changes.html#schema-changes-within-transactions).

    Cockroach Labs recommends that you perform schema changes outside explicit transactions. When a database [schema management tool](third-party-database-tools.html#schema-migration-tools) manages transactions on your behalf, include one schema change operation per transaction.
