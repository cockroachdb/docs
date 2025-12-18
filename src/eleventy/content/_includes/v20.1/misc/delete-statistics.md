To delete statistics for all tables in all databases:

~~~ sql
> DELETE FROM system.table_statistics WHERE true;
~~~

To delete a named set of statistics (e.g, one named "users_stats"), run a query like the following:

~~~ sql
> DELETE FROM system.table_statistics WHERE name = 'users_stats';
~~~

After deleting statistics, restart the nodes in your cluster to clear the statistics caches.

For more information about the `DELETE` statement, see [`DELETE`](delete.html).
