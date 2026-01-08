The statement syntax and output documented on this page use the updated `SHOW RANGES` that **will become the default in CockroachDB v23.2**. To enable this syntax and output, set the [cluster setting `sql.show_ranges_deprecated_behavior.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-show-ranges-deprecated-behavior-enabled)  to `false`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.show_ranges_deprecated_behavior.enabled = false;
~~~

The pre-v23.1 output of `SHOW RANGES` is deprecated in v23.1 **and will be removed in v23.2**.

When you use the deprecated version of the `SHOW RANGES` statement, the following message will appear, reminding you to update [the cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-show-ranges-deprecated-behavior-enabled):

~~~
NOTICE: attention! the pre-23.1 behavior of SHOW RANGES and crdb_internal.ranges{,_no_leases} is deprecated!
HINT: Consider enabling the new functionality by setting 'sql.show_ranges_deprecated_behavior.enabled' to 'false'.
The new SHOW RANGES statement has more options. Refer to the online documentation or execute 'SHOW RANGES ??' for details.
~~~
