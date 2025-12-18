1. As the `root` user, open the [built-in SQL client]({% link "{{ page.version.version }}/cockroach-sql.md" %}):

    ~~~ shell
    cockroach sql --insecure
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link "{{ page.version.version }}/cluster-settings.md" %}):

    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

    {% dynamic_include page.version.version, "/cdc/cdc-cloud-rangefeed.md" %}
