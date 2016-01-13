---
title: Start a Local Cluster
toc: false
---

Once you've [installed CockroachDB locally](/install-cockroachdb), the quickest way to test out the database is to start a single-node cluster and talk to the node via the built-in SQL client. There are two ways to do this:

- [Development Mode (Insecure)](#development-mode)  
Data is stored in-memory and client/server communication is completely insecure. This mode is great for learning CockroachDB, but there's no authentication or encryption, so it's not suitable for actual development.

- [Standard Mode (Secure)](#standard-mode)  
Data is stored on-disk and client/server communication is secure. Setup involves creating certificates and passing certain command line options, but it's still simple. This mode is suitable for actual development. 

{{site.data.alerts.callout_info}} For production deployments, see <a href="http://cockroachlabs.com/docs/deploy-a-multinode-cluster.html">Deploy a Multi-Node Cluster</a>.{{site.data.alerts.end}}

## Development Mode

1. From the directory containing the `cockroach` binary, start the cluster:
    
    ```bash
    $ ./cockroach start --dev
    ```
    The `--dev` flag defaults storage to in-memory and client/server communication to insecure. If you'd rather set these attributes manually, you can use the `--insecure` and `--stores=mem=<integer>` flags, where `<integer>` is the in-memory store size in bytes. 

2. In a new shell, start the built-in SQL client in development mode:

    ```bash
    $ ./cockroach sql --dev
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ```

4. [Run some queries](/basic-sql-commands.html).

## Standard Mode

1. From the directory containing the `cockroach` binary, initialize the cluster:

    ```
    $ ./cockroach init --stores=ssd=/temp/data
    ```
    where `ssd` can be any arbitrary string describing the store (e.g., `ssd` for flash, `hdd` for spinny disk) and `/temp/data` is the filepath to the storage location. For the filepath, the parent directory must exist and the store directory, if it already exists, must not contain any CockroachDB data.

2. Create certificates for the cluster:

    ```bash
    $ ./cockroach cert create-ca
    $ ./cockroach cert create-node localhost $(hostname) 
    ```
    These commands create the `ca.cert`, `ca.key`, `node.server.crt`, and `node.server.key` files in the `/certs` directory.  

3. Start the cluster:

    ```
    $ ./cockroach start --stores=ssd=/temp/data --gossip=localhost:26257
    ```
    In the `--gossip` flag, `localhost:26257` is the default host and port for CockroachDB. 

3. Create certificates for the built-in SQL client:

    ```bash
    $ ./cockroach cert create-client root
    ```
    This command creates the cert `root.client.crt`, `root.client.key`, `node.client.crt`, and `node.client.key` files in the `/certs` directory.

3. In a new shell, start the built-in SQL client:

    ```bash
    $ ./cockroach sql
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ```

4. [Run some queries](/basic-sql-commands.html).

## What's Next?
Learn more about [CockroachDB SQL](/basic-sql-commands.html) and start [building a test app](/build-a-test-app.html).
