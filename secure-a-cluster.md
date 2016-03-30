---
title: Secure a Cluster
toc: false
expand: true
---

Now that you have a [local cluster](start-a-local-cluster.html) up and running, let's secure it with authentication and encryption. This involves stopping the cluster, creating certificates, and restarting nodes with a few additional flags.

1.  Stop the cluster:

    ~~~ shell
    $ ./cockroach quit --insecure
    $ ./cockroach quit --insecure --http-port=8081
    $ ./cockroach quit --insecure --http-port=8082
    ~~~

    <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure1">Details</button>
    <div id="details-secure1" class="collapse">
        <ul>
            <li>If you used the <code>cockroach start</code> commands on <a href="start-a-local-cluster.html">Start a Cluster</a> verbatim, the commands above will work as well. Otherwise, just set the <code>--http-port</code> flag to the ports you used.</li>
            <li>For more details about the <code>cockroach quit</code> command, see <a href="stop-a-node.html">Stop a Node</a>.</li>
        </ul>
    </div>

2.  Create security certificates:

    ~~~ shell
    $ mkdir certs
    $ ./cockroach cert create-ca --ca-cert=certs/ca.cert --ca-key=certs/ca.key
    $ ./cockroach cert create-node localhost $(hostname) --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/node.cert --key=certs/node.key
    $ ./cockroach cert create-client root --ca-cert=certs/ca.cert --ca-key=certs/ca.key --cert=certs/root.cert --key=certs/root.key
    ~~~

    <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure2">Details</button>
    <div id="details-secure2" class="collapse">
        <ul>
            <li>The first command makes a new directory for the certificates.</li>
            <li>The second command creates the Certificate Authority (CA) certificate and key: <code>ca.cert</code> and <code>ca.key</code>.</li>
            <li>The third command creates the node certificate and key: <code>node.cert</code> and <code>node.key</code>. These files will be used to secure communication between nodes. Typically, you would generate these separately for each node since each node has unique addresses; in this case, however, since all nodes will be running locally, you need to generate only one node certificate and key.</li>
            <li>The fourth command creates the client certificate and key, in this case for the <code>root</code> user: <code>root.cert</code> and <code>root.key</code>. These files will be used to secure communication between the built-in SQL shell and the cluster (see step 5).</li>
        </ul>
    </div>

3.  Restart the first node:
 
    ~~~ shell
    $ ./cockroach start --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key &

    build:     {{site.data.strings.build}}
    admin:     https://ROACHs-MBP:8080
    sql:       postgresql://root@ROACHs-MBP:26257?sslcert=%2FUsers%2F...
    logs:      cockroach-data/logs
    store[0]:  path=cockroach-data
    ~~~

    <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure3">Details</button>
    <div id="details-secure3" class="collapse">
        <p>This command restarts your first node with its existing data, but securely. The command is the same as before, but you leave out the <code>--insecure</code> flag and instead use the <code>--ca-cert</code>, <code>--cert</code>, and <code>--key</code> flags to point to the CA certificate and the node certificate and key created in step 2.</p>
    </div>

3.  Restart additional nodes:

    ~~~ shell
    $ ./cockroach start --store=cockroach-data2 --port=26258 --http-port=8081 --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key &
    $ ./cockroach start --store=cockroach-data3 --port=26259 --http-port=8082 --join=localhost:26257 --ca-cert=certs/ca.cert --cert=certs/node.cert --key=certs/node.key &
    ~~~

    <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure4">Details</button>
    <div id="details-secure4" class="collapse">
        <p>These commands restart additional nodes with their existing data, but securely. The commands are the same as before, but you leave out the <code>--insecure</code> flag and instead use the <code>--ca-cert</code>, <code>--cert</code>, and <code>--key</code> flags to point to the CA certificate and the node certificate and key created in step 2.</p>
    </div>

4.  Restart the [built-in SQL client](use-the-built-in-sql-client.html) as an interactive shell:

    ~~~ shell
    $ ./cockroach sql --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ~~~

    <button type="button" class="btn details collapsed" data-toggle="collapse" data-target="#details-secure5">Details</button>
    <div id="details-secure5" class="collapse">
      <p>This command is the same as before, but you leave out the <code>--insecure</code> flag and instead use the <code>--ca-cert</code>, <code>--cert</code>, and <code>--key</code> flags point to the CA certificate and the certificate and key for the <code>root</code> user created in step 2.</p>
    </div>

5.  Run more [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    ~~~ shell
    root@:26257> SET DATABASE = bank;
    SET DATABASE

    root@26257> SELECT * FROM accounts;
    +------+----------+
    |  id  | balance  |
    +------+----------+
    | 1234 | 10000.50 |
    +------+----------+

    root@26257> INSERT INTO accounts VALUES (5678, DECIMAL '250.75');
    INSERT 1

    root@26257> SELECT * FROM accounts;
    +------+----------+
    |  id  | balance  |
    +------+----------+
    | 1234 | 10000.50 |
    | 5678 | 250.75   |
    +------+----------+
    ~~~

    When you're done using the SQL shell, press **CTRL + D** to exit.
 
6.  Continue monitoring your cluster with the [Admin UI](explore-the-admin-ui.html).

    If you already have it open, you'll need to change `http` to `https`. If you don't have it open, point your browser to the address in the `admin` field in the standard output of any node on startup. Note that your browser will consider the CockroachDB-created certificate invalid; you'll need to click through a warning message to get to the UI.

## What's Next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build a test app](build-a-test-app.html)
