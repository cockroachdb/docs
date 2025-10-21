### Failback issues

If the changefeed shows connection errors in `SHOW CHANGEFEED JOB`:

##### Connection refused

~~~
transient error: Post "https://replicator-host:30004/molt/public": dial tcp [::1]:30004: connect: connection refused
~~~

This indicates that Replicator is down, the webhook URL is incorrect, or the port is misconfigured.

**Resolution:** Verify that MOLT Replicator is running on the port specified in the changefeed `INTO` configuration. Confirm the host and port are correct.

##### Unknown schema error

~~~
transient error: 400 Bad Request: unknown schema:
~~~

This indicates the webhook URL path is incorrectly formatted. Common causes include using the wrong path format for your target database type or incorrect database names.

**Resolution:** Check the webhook URL path mapping:

- **PostgreSQL targets:** Use `/database/schema` format (for example, `/molt_db/public`).
- **MySQL/Oracle targets:** Use `/SCHEMA` format (for example, `/MOLT_DB`). Use only the schema name (for example, `molt` instead of `molt/public`).

Verify that the target database and schema names match the webhook URL.

##### GC threshold error

~~~
batch timestamp * must be after replica GC threshold
~~~

This indicates starting from an invalid cursor that has been garbage collected.

**Resolution:** Double-check the cursor to ensure it represents a valid range that has not been garbage collected, or extend the GC TTL on the source CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE defaultdb CONFIGURE ZONE USING gc.ttlseconds = {gc_ttl_in_seconds};
~~~

##### Duplicated data re-application

This occurs when resuming a changefeed from a cursor causes excessive data duplication.

**Resolution:** Clear the staging database to prevent duplication. **This deletes all checkpoints and buffered data**, so use with caution:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DATABASE _replicator;
~~~

For more targeted cleanup, delete mutations from specific staging tables:

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM _replicator.employees WHERE true;
~~~