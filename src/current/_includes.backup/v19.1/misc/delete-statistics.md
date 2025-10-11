To delete statistics for all tables in all databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM system.table_statistics WHERE true;
~~~

To delete a named set of statistics (e.g, one named "my_stats"), run a query like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM system.table_statistics WHERE name = 'my_stats';
~~~

After deleting statistics, restart the nodes in your cluster to clear the statistics caches.

For more information about the `DELETE` statement, see [`DELETE`](delete.html).
