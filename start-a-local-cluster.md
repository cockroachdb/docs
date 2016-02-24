---
title: Start a Local Cluster
toc: false
---

Once you've [installed CockroachDB locally](install-cockroachdb.html), it's easy to start a single- or multi-node cluster locally and talk to it via the built-in SQL client. Your cluster can be insecure or secure:

- [Insecure](#insecure)  
This is the fastest way to start up a cluster and learn CockroachDB, but there's no client/server authentication or encryption, so it's suitable only for limited testing and development.

- [Secure](#secure)  
Starting up a cluster with authenticated, encrypted client/server communication involves creating certificates and passing a few additional command line options, but it's still simple. 

{{site.data.alerts.callout_info}} Want to deploy CockroachDB in production? See <a href="on-premise-deployment.html">On-Premise Deployment</a> or <a href="cloud-deployment.html">Cloud Deployment</a>.{{site.data.alerts.end}}

## Insecure

1. From the directory containing the `cockroach` binary, start your first node:

   ~~~ shell
   $ ./cockroach start --insecure
   ~~~

   - The `--insecure` flag sets client/server communication to insecure on the default port, 26257. To bind to different port, set `--port=<port>`.

   - Node storage defaults to the `cockroach-data` directory. To store to a different directory, set `--stores=<filepath>`. 

2. For each additional node, repeat step 1 with a few extra flags:

   ~~~ shell
   $ ./cockroach start --insecure --stores=<filepath> --port=26258 --join=localhost:26257
   ~~~

   - Set the `--stores` flag to a storage location not in use by other nodes. To use multiple stores for the node, comma-separate the filepaths.

   - Set the `--port` flag to a port not in use by other nodes.
  
   - The `--join` flag connects the new node to the cluster. Set this flag to `localhost` and the port of the first node.

2. In a new shell, start the built-in SQL client:

   ~~~ shell
   $ ./cockroach sql --insecure
   ~~~

3. [Run some queries](basic-sql-statements.html).

4. [Check out the Admin UI](explore-the-admin-ui.html) by pointing your browser to `http://<your local host>:26257`. You can find the complete address in the the `admin` field in the response after starting a node.

## Secure

1. From the directory containing the `cockroach` binary, create security certificates:

   ~~~ shell
   $ ./cockroach cert create-ca
   $ ./cockroach cert create-node localhost $(hostname)
   $ ./cockroach cert create-client root
   ~~~

   - The first two commands create a default `certs` directory and add the certificate authority files and files for the node: `ca.cert`, `ca.key`,`node.server.crt`, `node.server.key`, `node.client.crt`, and `node.client.key`. 
   
   - The last command adds the files for the SQL client: `root.client.crt` and `root.client.key`.

2. Start a secure node:
 
   ~~~ shell
   $ ./cockroach start
   ~~~

   - Secure communication uses the certificates in the `certs` directory and defaults to port 26257. To bind to a different port, set `--port=<port>`.

   - Node storage defaults to the `cockroach-data` directory. To store to a different directory, set `--stores=<filepath>`.

3. For each additional node, repeat step 1 with a few extra flags:

   ~~~ shell
   $ ./cockroach start --stores=<filepath> --port=26258 --join=localhost:26257
   ~~~

   - Set the `--stores` flag to a storage location not in use by other nodes. To use multiple stores for the node, comma-separate the filepaths.

   - Set the `--port` flag to a port not in use by other nodes.
  
   - The `--join` flag connects the new node to the cluster. Set this flag to `localhost` and the port of the first node.

4. In a new shell, start the built-in SQL client:

   ~~~ shell
   $ ./cockroach sql
   ~~~

4. [Run some queries](basic-sql-statements.html).

5. [Check out the Admin UI](explore-the-admin-ui.html) by pointing your browser to `https://<your local host>:26257`. You can find the complete address in the the `admin` field in the response after starting a node. Note that your browser will consider the cockroach-created certificate invalid, so you'll need to click through a warning message to get the UI.

## What's Next?

Learn more about [CockroachDB SQL](basic-sql-statements.html) and start [building a test app](build-a-test-app.html).
