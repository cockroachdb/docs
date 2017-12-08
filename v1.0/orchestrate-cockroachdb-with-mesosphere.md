---
title: Orchestrate CockroachDB with Mesosphere DC/OS
summary: How to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with Mesosphere DC/OS.
toc: false
---

This page shows you how to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with [Mesosphere DC/OS](https://mesosphere.com/).

<div id="toc"></div>

## Step 1. Install and Launch DC/OS

The fastest way to get up and running is to use the [open source DC/OS template on AWS CloudFormation](https://dcos.io/docs/latest/installing/cloud/aws/basic/). However, you can find details about other open source or enterprise DC/OS installation methods in the official documentation:

- [Open Source DC/OS](https://dcos.io/docs/latest/installing/)
- [Enterprise DC/OS](https://docs.mesosphere.com/latest/installing/)

When using AWS CloudFormation, the launch process generally takes 10 to 15 minutes. Once you see the `CREATE_COMPLETE` status in the CloudFormation UI, be sure to [launch DC/OS](https://dcos.io/docs/latest/installing/cloud/aws/basic/#-a-name-launchdcos-a-launch-dc-os) and [install the DC/OS CLI](https://dcos.io/docs/latest/cli/install/).

## Step 2. Start CockroachDB

1. Review the default CockroachDB configuration:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos package describe --config cockroachdb
    ~~~

    The [default CockroachDB configuration](https://github.com/cockroachdb/dcos-cockroachdb-service#node-settings) creates a 3-node CockroachDB cluster with reasonable defaults, but you may require different settings depending on the context of your deployment. To customize the settings for your deployment, create a `cockroach.json` file based on the output of the command above. Be sure to consider our [Recommended Production Settings](recommended-production-settings.html).

2. Start the CockroachDB cluster as a DC/OS service.
    - If you are using the default configuration, run:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ dcos package install cockroachdb
        ~~~
    - If you created a custon `cockroach.json` configuration, run:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ dcos package install cockroachdb --options=cockroach.json
        ~~~

3. Monitor the cluster's deployment from the **Services** tab of the DC/OS UI.

{{site.data.alerts.callout_info}}You can <a href="https://dcos.io/docs/latest/deploying-services/install/#installing-a-service-using-the-gui">install CockroachDB from the DC/OS UI</a> as well.{{site.data.alerts.end}}

## Step 3. Test the cluster

1. Discover the endpoints for your CockroachDB cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos cockroachdb endpoints pg
    ~~~

    ~~~
    {
      "address": [
        "10.0.0.212:26257",
        "10.0.2.57:26257",
        "10.0.3.81:26257"
      ],
      "dns": [
        "cockroachdb-0-node-init.cockroachdb.autoip.dcos.thisdcos.directory:26257",
        "cockroachdb-1-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257",
        "cockroachdb-2-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257"
      ],
      "vip": "pg.cockroachdb.l4lb.thisdcos.directory:26257"
    }
    ~~~

    The endpoints returned will include:
    - `.mesos` hostnames for each instance that will follow the instances if they're moved within the DC/OS cluster.
    - A direct IP address for each instance, if `.mesos` hostnames are not resolvable.
    - A `vip` address, which is an HA-enabled hostname for accessing any of the instances. You'll use the `vip` address in the next step.

    In general, the `.mesos` endpoints will only work from within the same DC/OS cluster. From outside the cluster, you can either use the direct IPs or set up a proxy service that acts as a frontend to your CockroachDB instance. For development and testing purposes, you can use [DC/OS Tunnel](https://dcos.io/docs/latest/developing-services/tunnel/) to access services from outside the cluster, but this option is not suitable for production use.

2. [SSH to the DC/OS master node](https://dcos.io/docs/latest/administering-clusters/sshcluster/):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos node ssh --master-proxy --leader
    ~~~

3. Start a temporary container and open the [built-in SQL shell](use-the-built-in-sql-client.html) inside it, using the the `vip` endpoint as the `--host`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker run -it cockroachdb/cockroach:v1.0.6  sql --insecure --host=pg.cockroachdb.l4lb.thisdcos.directory
    ~~~

    ~~~
    # Welcome to the cockroach SQL interface.
    # All statements must be terminated by a semicolon.
    # To exit: CTRL + D.
    root@pg.cockroachdb.l4lb.thisdcos.directory:26257/>
    ~~~

4. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
    +----+---------+
    | id | balance |
    +----+---------+
    |  1 |  1000.5 |
    +----+---------+
    (1 row)
    ~~~

5. Exit the SQL shell and delete the temporary pod:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Scale the cluster

You can make changes to the CockroachDB service after it has been launched. Configuration management is handled by the scheduler process, which in turn handles deploying CockroachDB itself.

1. In the DC/OS UI, go to the **Services** table.
2. Select the **cockroachdb** service.
3. In the upper right, select **Edit**.
4. Select **Environment**.
5. Update the `NODE_COUNT` variable to match the number of CockroachDB nodes you want.
6. Click **Review & Run** and then **Run Service**.

The Scheduler process will then be restarted with the new configuration and will validate any detected changes. If the detected changes pass validation, the relaunched Scheduler will deploy the changes by sequentially relaunching affected tasks.

To check that nodes were successfully added to the cluser, you can run the [`cockroach node status`](view-node-details.html) command in a temporary container, again using the the `vip` endpoint as the `--host`:

{% include copy-clipboard.html %}
~~~ shell
$ docker run -it cockroachdb/cockroach:v1.0.6 node status --insecure --host=pg.cockroachdb.l4lb.thisdcos.directory
~~~

~~~
+----+--------------------------------------------------------------------------+--------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+------------------+-----------------------+--------+--------------------+------------------------+
| id |                                 address                                  | build  |     updated_at      |     started_at      | live_bytes | key_bytes | value_bytes | intent_bytes | system_bytes | replicas_leaders | replicas_leaseholders | ranges | ranges_unavailable | ranges_underreplicated |
+----+--------------------------------------------------------------------------+--------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+------------------+-----------------------+--------+--------------------+------------------------+
|  1 | cockroachdb-0-node-init.cockroachdb.autoip.dcos.thisdcos.directory:26257 | v1.0.2 | 2017-12-11 20:59:12 | 2017-12-11 19:14:42 |   41183973 |      1769 |    41187432 |            0 |         6018 |                2 |                     2 |      2 |                  0 |                      0 |
|  2 | cockroachdb-1-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257 | v1.0.2 | 2017-12-11 20:59:12 | 2017-12-11 19:14:52 |     115448 |     71037 |      209282 |            0 |         6218 |                4 |                     4 |      4 |                  0 |                      0 |
|  3 | cockroachdb-2-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257 | v1.0.2 | 2017-12-11 20:59:03 | 2017-12-11 19:14:53 |     120325 |     72652 |      217422 |            0 |         6732 |                4 |                     3 |      4 |                  0 |                      0 |
|  4 | cockroachdb-3-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257 | v1.0.2 | 2017-12-11 20:59:03 | 2017-12-11 20:21:43 |   41248030 |     79147 |    41338632 |            0 |         6569 |                1 |                     1 |      1 |                  0 |                      0 |
|  5 | cockroachdb-4-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257 | v1.0.2 | 2017-12-11 20:59:04 | 2017-12-11 20:56:54 |   41211967 |     30550 |    41181417 |            0 |         6854 |                1 |                     1 |      1 |                  0 |                      0 |
+----+--------------------------------------------------------------------------+--------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+------------------+-----------------------+--------+--------------------+------------------------+
(5 rows)
~~~

## Step 5. Maintain the cluster

Choose the relevant maintenance task:

- [Update Configurations](#update-configurations)
- [Restart a Node](#restart-a-node)
- [Replace a Node](#replace-a-node)
- [Troubleshoot (Access Logs)](#troubleshoot-access-logs)

### Update Configurations

In addition to adding nodes, you can resize nodes, update placement constraints, and make other runtime configuration changes. Just follow the instructions in previous step, but change the environment variable for the update you want to make.

- After making a change, the scheduler will be restarted and automatically deploy any detected changes to the service, one node at a time. For example, a given change will first be applied to `cockroachdb-0`, then `cockroachdb-1`, and so on.
- Nodes are configured with a "Readiness check" to ensure that the underlying service appears to be in a healthy state before continuing with applying a given change to the next node in the sequence. However, this basic check is not foolproof and reasonable care should be taken to ensure that a given configuration change will not negatively affect the behavior of the service.

### Restart a Node

You can restart a node while keeping it as its current location with its current persistent volume data. This may be thought of as similar to restarting a system process, but it also deletes any data that is not on a persistent volume.

1. Get the pod name for the node you want to restart:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos cockroachdb pod list
    ~~~~

    ~~~~
    [
      "cockroachdb-0",
      "cockroachdb-1",
      "cockroachdb-2",
      "cockroachdb-3",
      "cockroachdb-4",
      "metrics-0"
    ]
    ~~~~

2. Restart the relevant pod:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos cockroachdb pods restart cockroachdb-<NUM>
    ~~~

### Replace a Node

You can move a node to a new system and discard the persistent volumes at the prior system to be rebuilt at the new system. Nodes are not moved automatically, so this step must be performed performed, for example, before a system is offlined or when a system has already been offlined.

1. Get the pod name for the node you want to restart:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos cockroachdb pod list
    ~~~~

    ~~~~
    [
      "cockroachdb-0",
      "cockroachdb-1",
      "cockroachdb-2",
      "cockroachdb-3",
      "cockroachdb-4",
      "metrics-0"
    ]
    ~~~~

2. Stop and restart the pod at a new location in the DC/OS cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos cockroachdb pods replace cockroachdb-<NUM>
    ~~~

### Troubleshoot (Access Logs)

Logs for the scheduler and all service (i.e., CockroachDB) nodes can be viewed from the DC/OS web interface.

- Scheduler logs are useful for determining why a node isn't being launched (this is under the purview of the Scheduler).
- Node logs are useful for examining problems in the service itself, i.e., CockroachDB.

In all cases, logs are generally piped to files named stdout and/or stderr.

To view logs for a given node:

1. In the DC/OS UI, go to the **Services** table.
2. Select the **cockroachdb** service.
3. In the list of tasks for the service, select the task to be examined (scheduler is named after the service, nodes are `cockroachdb-0-node-init` or `cockroachdb-#-node-join`).
4. In the task details, go to the **Logs** tab.

## Step 9. Stop the cluster

## See Also

- [Orchestrate CockroachDB with Docker Swarm](orchestrate-cockroachdb-with-docker-swarm.html)
- [Cloud Deployment](cloud-deployment.html)
- [Manual Deployment](manual-deployment.html)
- [Local Deployment](start-a-local-cluster.html)
