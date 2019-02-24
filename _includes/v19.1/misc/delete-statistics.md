To delete statistics for all tables in all databases:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM system.table_statistics WHERE true;
~~~

To delete a named set of statistics (e.g, one named "my_stats"), run a query like the following:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM system.table_statistics WHERE name = 'my_stats';
~~~

For more information about the `DELETE` statement, see [`DELETE`](delete.html).
