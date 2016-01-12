---
title: Start Up a Local Cluster
toc: false
---

Once you've [installed CockroachDB locally](/install-cockroachdb), the quickest way to test out the database is to start a single-node cluster and talk to the node via the built-in SQL client. There are two ways to do this:

- [Development Mode (Insecure)](#development-mode)  
Data is stored in-memory and client/server communication is completely insecure. This mode is great for learning CockroachDB functionality but not suitable for actual development.

- [Standard Mode (Secure)](#standard-mode)  
Data is stored on-disk and client/server communication is secure. Setup involves creating certificates and passing certain command line options, but it's still simple. This mode is safest for actual development. 

{{site.data.alerts.callout_success}} For production deployments, see <a href="http://cockroachlabs.com/docs/deploy-a-multinode-cluster.html">Deploy a Multi-Node Cluster</a>.{{site.data.alerts.end}}

If using Docker, all command should be run inside the Docker container.

## Development Mode

1. Start the database:
    
    ```bash
    $ ./cockroach start --dev
    ```
    The `--dev` flag sets the storage to in-memory and client/server communication to insecure. 

    If your `PATH` does not include the location of the `cockroach` binary, enter the full path in your shell, for example:

    ```bash
    $ src/github.com/cockroachdb/cockroach/cockroach start --dev
    ```

2. In a new shell, start the built-in SQL client in development mode:

    ```bash
    $ ./cockroach sql --dev
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ```

4. [Run some queries](/basic-sql-commands.html).

## Standard Mode

1. Initialize the cluster:

    ```bash
    $ ./cockroach init --stores=ssd=data
    ```
    The `--stores` flag sets the path for local storage.

    If your `PATH` does not include the location of the `cockroach` binary, enter the full path in your shell, for example:

    ```bash
    $ src/github.com/cockroachdb/cockroach/cockroach init --stores=ssd=data
    ```

2. Create certificates for the database:

    ```bash
    $ ./cockroach cert create-ca
    $ ./cockroach cert create-node localhost $(hostname) 
    ```

3. Start the database:

    ```bash
    $ ./cockroach start --stores=ssd=data --gossip=localhost:26257
    ```

3. Create certificates for the built-in SQL client:

    ```bash
    $ ./cockroach cert create-client root
    ```

3. In a new shell, start the built-in SQL client in development mode:

    ```bash
    $ ./cockroach sql
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ```

4. [Run some queries](/basic-sql-commands.html).

## What's Next?
Learn more about **CockroachDB SQL** and start **building a test app**.
