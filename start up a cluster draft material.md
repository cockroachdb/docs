## Standard Mode (Insecure)

1. Initialize the cluster:

    ```bash
    $ ./cockroach init --stores=ssd=data
    ```
    The `--stores` flag sets the path for local storage.
    
2. Start the database:

    ```bash
    $ ./cockroach start --insecure --stores=ssd=data --gossip=localhost:26257
    ```

3. In a new shell, start the built-in SQL client:

    ```bash
    $ ./cockroach sql --insecure
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ```

4. Run some queries:



## Single Node Insecure
Warning about insecure:
- no authentication
- no encryption
- no security whatsoever

## Single Node Secure
Assuming you have ssh access to three machines.

{{site.data.alerts.callout_success}} To run a multi-node cluster, see <a href="http://cockroachlabs.com/docs/deploy-to-a-cloud-provider.html">Deploy to a Cloud Provider</a>.{{site.data.alerts.end}}

1. Navigate to the CockroachDB binary.

2. In the directorStart the database in development mode (data stored in-memory):

    ```bash
    $ ./cockroach start --dev
    ```
    Alternately, to start in standard more (data stored on-disk):

    ```bash
    $ ./cockroach init --stores=ssd=data
    $ ./cockroach cert create-ca
    # Default directory for certificates is ./certs/. Command fails if the two files aleady exits. Location of cert directory can be overwritten with --certs flag, e.g., --certs=~/mycerts. applies to any command using certificates (start, sql, cert, quit)
    $ ./cockroach cert create-node localhost $(hostname)
    $ ./cockroach start --stores=ssd=data --gossip=localhost:26257
    26257 is default port for CockroachDB
    Note that CockroachDB expects at least 3 nodes by default, so you'll see error message. Disregard in case where one node cluster is intentional.
    ```

    single-node secure:
    need to create client cert before starting sql client.
    $ ./cockroach cert create-client root (defaults to using the root user, which has permission to create databases, tables, etc. - don't have to set any user permissions) - creates two files: root.client.crt   root.client.key
    $ ./cockroach sql

We use certificates for security. Needed whenever client/server communicates, or nodes communicates

CA (certificate authority) created one
Node cert once per node

`create-ca` must easier than OpenSSL. We'll have to document create-ca assumptions. Either run our command or here's openSSL command to do same thing.

3. In a new shell, start the built-in SQL client:

    ```bash
    $ ./cockroach sql --dev
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    ```

    If the database is running in standard mode, run the following instead:

    ```bash
    $ ?????
    ```

4. Run some queries:

