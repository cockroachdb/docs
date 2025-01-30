1. As the `root` user, open the [built-in SQL client]({{ page.version.version }}/cockroach-sql.md):

    {% include "_includes/copy-clipboard.html" %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

1. Set your organization name and [{{ site.data.products.enterprise }} license]({{ page.version.version }}/licensing-faqs.md#types-of-licenses) key:

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<organization name>';
    ~~~

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<secret>';
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting]({{ page.version.version }}/cluster-settings.md):

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

    {% include "_includes/25.1/cdc/cdc-cloud-rangefeed.md" %}
