To enable super regions, set the `enable_super_regions` [session setting](set-vars.html) to `'on'`:

~~~ sql
SET enable_super_regions = 'on';
~~~

~~~
SET
~~~

You can also set the `sql.defaults.super_regions.enabled` [cluster setting](cluster-settings.html) to `true`:

~~~ sql
SET CLUSTER SETTING  sql.defaults.super_regions.enabled = true;
~~~

~~~
SET CLUSTER SETTING
~~~
