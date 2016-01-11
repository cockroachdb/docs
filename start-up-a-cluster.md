---
title: Run a Cluster
toc: false
---

Once you've [installed CockroachDB locally](/install-cockroachdb), the quickest way to learn and test out the database is to start a single-node cluster and talk to the node via the built-in SQL client. You can start the database either in development mode, where data is stored in-memory and certificates aren't required, or in standard mode, where data is store on-disk.

{{site.data.alerts.callout_success}} To run a multi-node cluster, see <a href="http://cockroachlabs.com/docs/deploy-to-a-cloud-provider.html">Deploy to a Cloud Provider</a>.{{site.data.alerts.end}}

1. Navigate to the CockroachDB binary:

    ```bash
    $ cd cockroach
    ```

2. Start the database in development mode:

    ```bash
    $ ./cockroach start --dev
    ```
    Alternately, start in standard mode:

    ```bash
    $ ./cockroach init
    $ ./cockroach start
    ```

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

## What's Next?
Learn more about **CockroachDB SQL** (link to come) and start **building a test app**.
