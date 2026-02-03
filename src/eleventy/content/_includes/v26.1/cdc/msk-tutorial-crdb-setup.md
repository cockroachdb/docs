1. (Optional) On the EC2 instance running CockroachDB, run the [Movr]({% link "{{ page.version.version }}/movr.md" %}) application workload to set up some data for your changefeed.

    Create the schema for the workload:

     ~~~shell
     cockroach workload init movr
     ~~~

     Then run the workload:

     ~~~shell
     cockroach workload run movr --duration=1m
     ~~~

1. Start a SQL session. For details on the available flags, refer to the [`cockroach sql`]({% link "{{ page.version.version }}/cockroach-sql.md" %}) page.

    ~~~ shell
    cockroach sql --insecure
    ~~~

    {{site.data.alerts.callout_info}}
    To set your {{ site.data.products.enterprise }} license, refer to the [Licensing FAQs]({% link "{{ page.version.version }}/licensing-faqs.md" %}#set-a-license) page.
    {{site.data.alerts.end}}

1. Enable the `kv.rangefeed.enabled` [cluster setting]({% link "{{ page.version.version }}/cluster-settings.md" %}):

    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~