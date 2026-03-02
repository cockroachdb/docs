### Failback issues

If the changefeed shows connection errors in `SHOW CHANGEFEED JOB`:

##### Connection refused

~~~
transient error: Post "https://replicator-host:30004/migration_db/migration_schema": dial tcp [::1]:30004: connect: connection refused
~~~

This indicates that Replicator is down, the webhook URL is incorrect, or the port is misconfigured.

**Resolution:** Verify that MOLT Replicator is running on the port specified in the changefeed `INTO` configuration. Confirm the host and port are correct.

##### Incorrect schema path errors

This error occurs when the [CockroachDB changefeed]({% link {{ site.current_cloud_version }}/create-and-configure-changefeeds.md %}) webhook URL path does not match the target database schema naming convention:

~~~
transient error: 400 Bad Request: unknown schema:
~~~

The webhook URL path is specified in the `INTO` clause when you [create the changefeed]({% link molt/migrate-failback.md %}#create-the-cockroachdb-changefeed). For example: `webhook-https://replicator-host:30004/database/schema`.

**Resolution:** Verify the webhook path format matches your target database type:

<section class="filter-content" markdown="1" data-scope="postgres">
- PostgreSQL targets should use `/database/schema` format. For example, `webhook-https://replicator-host:30004/migration_db/migration_schema`.
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
- MySQL targets should use `/database` format. For example, `webhook-https://replicator-host:30004/migration_db`.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
- Oracle targets should use `/SCHEMA` format in uppercase. For example, `webhook-https://replicator-host:30004/MIGRATION_SCHEMA`.
</section>

For details on configuring the webhook sink URI, refer to [Webhook sink]({% link {{ site.current_cloud_version }}/changefeed-sinks.md %}#webhook-sink).

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