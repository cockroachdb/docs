{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/known-limitations/system-range-replication.md %}
{{site.data.alerts.end}}

To edit the default replication zone, use the `CONFIGURE ZONE` statement to define the values you want to change (other values will be copied from the `.default` zone):

{% include copy-clipboard.html %}
~~~ shell
> ALTER RANGE default CONFIGURE ZONE USING num_replicas = 5, gc.ttlseconds = 100000;
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include copy-clipboard.html %}
~~~ shell
> SHOW ZONE CONFIGURATION FOR RANGE default;
~~~

~~~
  zone_name |                config_sql
+-----------+------------------------------------------+
  .default  | ALTER RANGE default CONFIGURE ZONE USING
            |     range_min_bytes = 1048576,
            |     range_max_bytes = 67108864,
            |     gc.ttlseconds = 100000,
            |     num_replicas = 5,
            |     constraints = '[]',
            |     lease_preferences = '[]'
(1 row)
~~~
