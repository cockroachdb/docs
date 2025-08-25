{% unless include.hide-enterprise-warning == "true" %}

{% endunless %}

Once [partitions have been defined for a table or a secondary index]({% link {{ page.version.version }}/partitioning.md %}), to control replication for a partition, use `ALTER PARTITION <partition> OF INDEX <table@index> CONFIGURE ZONE`:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER PARTITION us_west OF INDEX vehicles@primary
    CONFIGURE ZONE USING
      num_replicas = 5,
      constraints = '[+region=us-west1]';
~~~

~~~
CONFIGURE ZONE 1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER PARTITION us_west OF INDEX vehicles@vehicles_auto_index_fk_city_ref_users
    CONFIGURE ZONE USING
      num_replicas = 5,
      constraints = '[+region=us-west1]';
~~~

~~~
CONFIGURE ZONE 1
~~~

To define replication zones for identically named partitions of a table and its secondary indexes, you can use the `<table>@*` syntax to save several steps:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER PARTITION us_west OF INDEX vehicles@*
    CONFIGURE ZONE USING
      num_replicas = 5,
      constraints = '[+region=us-west1]';
~~~

To view the zone configuration for a partition, use `SHOW ZONE CONFIGURATION FROM PARTITION <partition> OF INDEX <table@index>`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ZONE CONFIGURATION FROM PARTITION us_west OF INDEX vehicles@primary;
~~~

~~~
                    target                    |                             raw_config_sql
----------------------------------------------+-------------------------------------------------------------------------
  PARTITION us_west OF INDEX vehicles@primary | ALTER PARTITION us_west OF INDEX vehicles@primary CONFIGURE ZONE USING
                                              |     range_min_bytes = 134217728,
                                              |     range_max_bytes = 536870912,
                                              |     gc.ttlseconds = 90000,
                                              |     num_replicas = 5,
                                              |     constraints = '[+region=us-west1]',
                                              |     lease_preferences = '[]'
(1 row)
~~~

{{site.data.alerts.callout_success}}
You can also use the [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}) statement or [`SHOW PARTITIONS`]({% link {{ page.version.version }}/show-partitions.md %}) statements to view details about all of the replication zones defined for the partitions of a table and its secondary indexes.
{{site.data.alerts.end}}
