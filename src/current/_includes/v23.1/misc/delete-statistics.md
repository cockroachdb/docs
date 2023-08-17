To delete statistics for all tables in all databases:

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM system.table_statistics WHERE true;
~~~

To delete a named set of statistics (e.g, one named "users_stats"), run a query like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM system.table_statistics WHERE name = 'users_stats';
~~~

For more information about the `DELETE` statement, see [`DELETE`]({% link {{ page.version.version }}/delete.md %}).
