Use the `ttl_disable_changefeed_replication` table storage parameter to prevent changefeeds from sending `DELETE` messages issued by row-level TTL jobs for a table. Include the storage parameter when you create or alter the table. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE tbl (
  id UUID PRIMARY KEY default gen_random_uuid(),
  value TEXT
) WITH (ttl_expire_after = '3 weeks', ttl_job_cron = '@daily', ttl_disable_changefeed_replication = 'true');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events SET (ttl_expire_after = '1 year', ttl_disable_changefeed_replication = 'true');
~~~

You can also widen the scope to the cluster by setting the `sql.ttl.changefeed_replication.disabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `true`. This will prevent changefeeds from emitting deletes issued by all TTL jobs on a cluster.

If you want to have a changefeed ignore the storage parameter or cluster setting that disables changefeed replication, you can set the changefeed option `ignore_disable_changefeed_replication` to `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE table_name INTO 'external://changefeed-sink'
  WITH resolved, ignore_disable_changefeed_replication = true;
~~~

This is useful when you have multiple use cases for different changefeeds on the same table. For example, you have a table with a changefeed streaming changes to another database for analytics workflows in which you do not want to reflect row-level TTL deletes. Secondly, you have a changefeed on the same table for audit-logging purposes for which you need to persist every change through the changefeed.