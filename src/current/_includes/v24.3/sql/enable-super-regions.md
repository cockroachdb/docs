To enable super regions, set the `enable_super_regions` [session setting]({% link {{ page.version.version }}/set-vars.md %}) to `'on'`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET enable_super_regions = 'on';
~~~

~~~
SET
~~~

You can also set the `sql.defaults.super_regions.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING  sql.defaults.super_regions.enabled = true;
~~~

~~~
SET CLUSTER SETTING
~~~
