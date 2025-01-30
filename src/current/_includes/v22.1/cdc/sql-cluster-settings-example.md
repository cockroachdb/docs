1. As the `root` user, open the [built-in SQL client](cockroach-sql.html):

    {% include "_includes/copy-clipboard.html" %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

1. Set your organization name and [{{ site.data.products.enterprise }} license](enterprise-licensing.html) key that you received via email:

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<organization name>';
    ~~~

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<secret>';
    ~~~

1. Enable the `kv.rangefeed.enabled` [cluster setting](cluster-settings.html):

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

    {% include "_includes/25.1/cdc/cdc-cloud-rangefeed.md" %}
