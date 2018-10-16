CockroachDB offers a pre-built `workload` binary for Linux that includes several load generators for simulating client traffic against your cluster. This step features CockroachDB's version of the [TPC-C](http://www.tpc.org/tpcc/) workload.

{{site.data.alerts.callout_success}}For comprehensive guidance on benchmarking CockroachDB with TPC-C, see our <a href="https://www.cockroachlabs.com/guides/cockroachdb-performance/">Performance Benchmarking white paper</a>.{{site.data.alerts.end}}

1. SSH to the machine where you want the run the sample TPC-C workload.

    This should be a machine that is not running a CockroachDB node, and it should already have a `certs` directory containing `ca.crt`, `client.root.crt`, and `client.root.key` files.

2. Download `workload` and make it executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST | chmod 755 workload.LATEST
    ~~~

3. Rename and copy `workload` into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i workload.LATEST /usr/local/bin/workload
    ~~~

4. Start the TPC-C workload, pointing it at the IP address of the load balancer and the location of the `ca.crt`, `client.root.crt`, and `client.root.key` files:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ workload run tpcc \
    --drop \
    --init \
    --duration=20m \
    --tolerate-errors \
    "postgresql://root@<IP ADDRESS OF LOAD BALANCER:26257/tpcc?sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
    ~~~

    This command runs the TPC-C workload against the cluster for 20 minutes, loading 1 "warehouse" of data initially and then issuing about 12 queries per minute via 10 "worker" threads. These workers share SQL connections since individual workers are idle for long periods of time between queries.

    {{site.data.alerts.callout_success}}For more <code>tpcc</code> options, use <code>workload run tpcc --help</code>. For details about other load generators included in <code>workload</code>, use <code>workload run --help</code>.

4. Use the [Admin UI](admin-ui-access-and-navigate.html) to monitor the load generator's progress.

    For each user who should have access to the Admin UI for a secure cluster, [create a user with a password](create-user.html). Then access the Admin UI by pointing a browser to the address in the `admin` field in the standard output of any node on startup. On accessing the Admin UI, you will see a Login screen, where you will need to enter your username and password.

    Since the load generator is pointed at the load balancer, the connections will be evenly distributed across nodes. To verify this, click **Metrics** on the left, select the **SQL** dashboard, and then check the **SQL Connections** graph. You can use the **Graph** menu to filter the graph for specific nodes.
