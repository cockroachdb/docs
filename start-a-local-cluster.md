---
title: Start a Local Cluster
toc: false
---

Once you've [installed CockroachDB locally](install-cockroachdb.html), the quickest way to try out the database is to start a single node cluster and talk to it via the built-in SQL client. You can also add more nodes to simulate a multi-node scenario. 

There are two modes in which you can do this:

- [Dev Mode (Insecure)](#dev-mode-insecure)  
Data is stored in-memory and client/server communication is completely insecure. This mode is great for learning CockroachDB, but since there's no authentication or encryption and nothing is stored persistently, it's suitable only for limited testing and development.  

- [Secure Mode](#secure-mode)  
Data is stored on-disk and client/server communication is secure. Setup involves creating certificates and passing certain command line options, but it's still simple. This mode is suitable for standing up a persistent test cluster to develop an application or test CockroachDB.

{{site.data.alerts.callout_info}} For production deployments, see <a href="deploy-a-multinode-cluster.html">Deploy a Multi-Node Cluster</a>.{{site.data.alerts.end}}

## Dev Mode (Insecure)

1. From the directory containing the `cockroach` binary, start a single-node cluster:
    
    ```bash
    $ ./cockroach start --dev
    ```
    The `--dev` flag defaults storage to in-memory, communication to insecure, and the client (SQL) and server (CockroachDB) ports to 15432 and 26257 respectively.

2. In a new shell, start the built-in SQL client in dev mode:

    ```bash
    $ ./cockroach sql --dev
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ```

3. [Run some queries](basic-sql-commands.html).

4. Check out the Admin UI by pointing your browser to `http://<your local host>:26257`. You can find your local host by running `hostname` in your shell.    

5. To simulate a multi-node cluster, add each new node as follows:
    
    ```bash
    $ ./cockroach start --dev pgport=15433 --port=26258 --join=localhost:26257
    ```

    where `--pgport` and `--port` are set to ports not in use by other nodes and `--join` connects the new node to the cluster via your local host and the port of the first node, `26257`.

## Secure Mode

1. From the directory containing the `cockroach` binary, create security certificates:

    ```bash
    $ ./cockroach cert create-ca
    $ ./cockroach cert create-node localhost $(hostname) 
    $ ./cockroach cert create-client root
    ```
    These commands create certificates in the `certs` directory. The first two commands create the files for the cluster: `ca.cert`, `ca.key`, `node.server.crt`, `node.server.key`, `node.client.crt`, and `node.client.key`. The last command creates the files for the SQL client: `root.client.crt` and `root.client.key`.  

2. Start a single-node cluster:

    ```bash
    $ ./cockroach start --stores=ssd=data/node1
    ```
    where `ssd` can be any arbitrary string describing the store (e.g., `ssd` for flash, `hdd` for spinny disk) and `dev/data` is the filepath to the storage location. For the filepath, the parent directory must exist and the store directory, if it already exists, must not contain any CockroachDB data.
    
3. In a new shell, start the built-in SQL client:

    ```bash
    $ ./cockroach sql
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ```

4. [Run some queries](basic-sql-commands.html).

5. Check out the Admin UI by pointing your browser to `https://<your local host>:26257`. You can find your local host by running `hostname` in your shell. Note that your browser will consider the cockroach-created certificate invalid, so you'll need to click through a warning message to get the UI. 

6. To simulate a multi-node cluster, add each new node as follows:
    
    ```bash
    $ ./cockroach start --stores=ssd=data/node2 pgport=15433 --port=26258 --join=localhost:26257
    ```

    where `--stores` is set to a unique storage location, `--pgport` and `--port` are set to ports not in use by other nodes, and `--join` connects the new node to the cluster via your local host and the port of the first node, `26257`.

## What's Next?

Learn more about [CockroachDB SQL](basic-sql-commands.html) and start [building a test app](build-a-test-app.html).
