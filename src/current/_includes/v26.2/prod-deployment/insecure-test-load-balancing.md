CockroachDB comes with a number of [built-in workloads]({% link {{ page.version.version }}/cockroach-workload.md %}) for simulating client traffic. This step features CockroachDB's version of the [TPC-C](http://www.tpc.org/tpcc/) workload.

{{site.data.alerts.callout_info}}
Be sure that you have configured your network to allow traffic from the application to the load balancer. In this case, you will run the sample workload on one of your machines. The traffic source should therefore be the **internal (private)** IP address of that machine.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For comprehensive guidance on benchmarking CockroachDB with TPC-C, see [Performance Benchmarking]({% link {{ page.version.version }}/performance-benchmarking-with-tpcc-local.md %}).
{{site.data.alerts.end}}

1. SSH to the machine where you want the run the sample TPC-C workload.

    This should be a machine that is not running a CockroachDB node.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Use the [`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}) command to load the initial schema and data, pointing it at the IP address of the load balancer:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init tpcc \
    'postgresql://root@<IP ADDRESS OF LOAD BALANCER>:26257/tpcc?sslmode=disable'
    ~~~

1. Use the `cockroach workload` command to run the workload for 10 minutes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run tpcc \
    --duration=10m \
    'postgresql://root@<IP ADDRESS OF LOAD BALANCER>:26257/tpcc?sslmode=disable'
    ~~~

    You'll see per-operation statistics print to standard output every second:

    ~~~
    _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
          1s        0         1443.4         1494.8      4.7      9.4     27.3     67.1 transfer
          2s        0         1686.5         1590.9      4.7      8.1     15.2     28.3 transfer
          3s        0         1735.7         1639.0      4.7      7.3     11.5     28.3 transfer
          4s        0         1542.6         1614.9      5.0      8.9     12.1     21.0 transfer
          5s        0         1695.9         1631.1      4.7      7.3     11.5     22.0 transfer
          6s        0         1569.2         1620.8      5.0      8.4     11.5     15.7 transfer
          7s        0         1614.6         1619.9      4.7      8.1     12.1     16.8 transfer
          8s        0         1344.4         1585.6      5.8     10.0     15.2     31.5 transfer
          9s        0         1351.9         1559.5      5.8     10.0     16.8     54.5 transfer
         10s        0         1514.8         1555.0      5.2      8.1     12.1     16.8 transfer
    ...
    ~~~

    After the specified duration (10 minutes in this case), the workload will stop and you'll see totals printed to standard output:

    ~~~
    _elapsed___errors_____ops(total)___ops/sec(cum)__avg(ms)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)__result
      600.0s        0         823902         1373.2      5.8      5.5     10.0     15.2    209.7
    ~~~

    {{site.data.alerts.callout_success}}
    For more `tpcc` options, use `cockroach workload run tpcc --help`. For details about other workloads built into the `cockroach` binary, use `cockroach workload --help`.
    {{site.data.alerts.end}}

1. To monitor the load generator's progress, open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

    Since the load generator is pointed at the load balancer, the connections will be evenly distributed across nodes. To verify this, click **Metrics** on the left, select the **SQL** dashboard, and then check the **SQL Connections** graph. You can use the **Graph** menu to filter the graph for specific nodes.
