1. If you do not already have one, [request a trial {{ site.data.products.enterprise }} license]({% link "{{ page.version.version }}/licensing-faqs.md" %}#obtain-a-license).

1. Use the [`cockroach start-single-node`]({% link "{{ page.version.version }}/cockroach-start-single-node.md" %}) command to start a single-node cluster:

    ~~~ shell
    cockroach start-single-node --insecure --listen-addr=localhost
    ~~~

1. In this example, you'll run CockroachDB's [Movr]({% link "{{ page.version.version }}/movr.md" %}) application workload to set up some data for your changefeed.

     In a new terminal, first create the schema for the workload:

     ~~~shell
     cockroach workload init movr "postgresql://root@127.0.0.1:26257?sslmode=disable"
     ~~~

     Then run the workload:

     ~~~shell
     cockroach workload run movr --duration=1m "postgresql://root@127.0.0.1:26257?sslmode=disable"
     ~~~
