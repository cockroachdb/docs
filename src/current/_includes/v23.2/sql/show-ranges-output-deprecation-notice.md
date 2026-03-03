The statement syntax and output documented on this page use the updated `SHOW RANGES` that **is the default in CockroachDB v23.2**. To disable this syntax and output, set the [cluster setting `sql.show_ranges_deprecated_behavior.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-show-ranges-deprecated-behavior-enabled)  to `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.show_ranges_deprecated_behavior.enabled = true;
~~~

The pre-v23.1 output of `SHOW RANGES` was deprecated in v23.1 and will be removed in a future release.

When you use the deprecated version of the `SHOW RANGES` statement, the following message will appear, reminding you to update [the cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-show-ranges-deprecated-behavior-enabled):

~~~
NOTICE: deprecated use of SHOW RANGES or crdb_internal.ranges{,_no_leases} in combination with range coalescing - expect invalid results
HINT: Consider enabling the new functionality by setting 'sql.show_ranges_deprecated_behavior.enabled' to 'false'.
~~~
