CockroachDB offers a pre-built `workload` binary for Linux that includes several load generators for simulating client traffic against your cluster. This step features CockroachDB's version of the [TPC-C](http://www.tpc.org/tpcc/) workload.

{{site.data.alerts.callout_info}}
Be sure that you have [set up an inbound rule](deploy-cockroachdb-on-aws-insecure.html#step-2-configure-your-network) that allows traffic from the application to the load balancer. In this case, you will run the sample workload on one of your instances. The traffic source for your inbound rule should therefore be the **internal (private)** IP address of that instance. To find this, open the Instances section of the Amazon EC2 console and click on the instance.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}For comprehensive guidance on benchmarking CockroachDB with TPC-C, see our <a href="https://www.cockroachlabs.com/guides/cockroachdb-performance/">Performance Benchmarking white paper</a>.{{site.data.alerts.end}}

1. SSH to the machine where you want the run the sample TPC-C workload.

    This should be a machine that is not running a CockroachDB node.

2. Download `workload` and make it executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST ; chmod 755 workload.LATEST
    ~~~

3. Rename and copy `workload` into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i workload.LATEST /usr/local/bin/workload
    ~~~

4. Start the TPC-C workload, pointing it at the IP address of the load balancer:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ workload run tpcc \
    --drop \
    --init \
    --duration=20m \
    --tolerate-errors \
    "postgresql://root@<IP ADDRESS OF LOAD BALANCER>:26257/tpcc?sslmode=disable"
    ~~~

    This command runs the TPC-C workload against the cluster for 20 minutes, loading 1 "warehouse" of data initially and then issuing about 12 queries per minute via 10 "worker" threads. These workers share SQL connections since individual workers are idle for long periods of time between queries.

    {{site.data.alerts.callout_success}}For more <code>tpcc</code> options, use <code>workload run tpcc --help</code>. For details about other load generators included in <code>workload</code>, use <code>workload run --help</code>.

4. To monitor the load generator's progress, open the [DB Console](ui-overview.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

    Since the load generator is pointed at the load balancer, the connections will be evenly distributed across nodes. To verify this, click **Metrics** on the left, select the **SQL** dashboard, and then check the **SQL Connections** graph. You can use the **Graph** menu to filter the graph for specific nodes.
