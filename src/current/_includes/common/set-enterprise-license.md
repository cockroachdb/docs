Start the [`cockroach sql` shell]({% link {{ page.version.version }}/cockroach-sql.md %}). As the [`root` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#root-user), use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement to set the license key:

{% include_cached copy-clipboard.html %}
~~~ sql
>  SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx';
~~~
