1. As the `root` user, open the [built-in SQL client]({% link "{{ page.version.version }}/cockroach-sql.md" %}):

    ~~~ shell
    $ cockroach sql --insecure
    ~~~

1. Set your organization name and [{{ site.data.products.enterprise }} license]({% link "{{ page.version.version }}/licensing-faqs.md" %}#types-of-licenses) key:

    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<organization name>';
    ~~~

    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<secret>';
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link "{{ page.version.version }}/cluster-settings.md" %}):

    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

    {% dynamic_include page.version.version, "/cdc/cdc-cloud-rangefeed.md" %}
