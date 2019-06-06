---
title: Orchestrate CockroachDB with Mesosphere DC/OS (Insecure)
summary: How to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with Mesosphere DC/OS.
toc: true
---

This page shows you how to orchestrate the deployment and management of an insecure 3-node CockroachDB cluster with [Mesosphere DC/OS](https://mesosphere.com/).

{{site.data.alerts.callout_danger}}Deploying an <strong>insecure</strong> cluster is not recommended for data in production. We'll update this page once it's possible to orchestrate a secure cluster with Mesosphere DC/OS.{{site.data.alerts.end}}


## Before you begin

Before getting started, it's important to review some current requirements and limitations.

### Requirements

- Your cluster must have at least 3 private nodes.
- If you are using Enterprise DC/OS, you may need to [provision a service account](https://docs.mesosphere.com/1.9/security/ent/service-auth/custom-service-auth/) before installing CockroachDB. Only someone with `superuser` permission can create the service account.

    Security Mode | Service Account
    --------------|----------------
    `strict` | Required
    `permissive` | Optional
    `disabled` | Not Required

### Limitations

CockroachDB in DC/OS works the same as in other environments with the exception of the following limitations:

- The `cockroachdb` DC/OS service has been tested only on DC/OS versions 1.9 and 1.10.
- Running in secure mode is not supported at this time.
- Running a multi-datacenter cluster is not supported at this time.
- Removing a node is not supported at this time.
- Neither volume type nor volume size requirements may be changed after initial deployment.
- Rack placement and awareness are not supported at this time.

## Step 1. Install and Launch DC/OS

The fastest way to get up and running is to use the [open source DC/OS template on AWS CloudFormation](https://docs.mesosphere.com/1.10/installing/oss/cloud/aws/basic/). However, you can find details about other open source or enterprise DC/OS installation methods in the official documentation:

- [Open Source DC/OS](https://docs.mesosphere.com/1.10/installing/oss/)
- [Enterprise DC/OS](https://docs.mesosphere.com/1.10/installing/ent/)

When using AWS CloudFormation, the launch process generally takes 10 to 15 minutes. Once you see the `CREATE_COMPLETE` status in the CloudFormation UI, be sure to [launch DC/OS](https://docs.mesosphere.com/1.10/installing/oss/cloud/aws/basic/#launch-dcos) and [install the DC/OS CLI](https://docs.mesosphere.com/1.10/cli/install/).

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
    - If you created a custom `cockroach.json` configuration, run:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ dcos package install cockroachdb --options=cockroach.json
        ~~~

3. Monitor the cluster's deployment from the **Services** tab of the DC/OS UI.

{{site.data.alerts.callout_info}}You can <a href="https://docs.mesosphere.com/1.10/deploying-services/install/#installing-a-service-using-the-gui">install CockroachDB from the DC/OS UI</a> as well.{{site.data.alerts.end}}

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
    - A `vip` address, which is an HA-enabled hostname for accessing any of the instances. You'll use the `vip` address in some of the next steps.

    In general, the `.mesos` endpoints will only work from within the same DC/OS cluster. From outside the cluster, you can either use the direct IPs or set up a proxy service that acts as a frontend to your CockroachDB instance. For development and testing purposes, you can use a [DC/OS tunnel](https://docs.mesosphere.com/1.10/developing-services/tunnel/) to access services from outside the cluster, but this option is not suitable for production use. See [monitor the cluster](#step-4-monitor-the-cluster) below for more details.

2. [SSH to the DC/OS master node](https://docs.mesosphere.com/1.10/administering-clusters/sshcluster/):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos node ssh --master-proxy --leader
    ~~~

3. Start a temporary container and open the [built-in SQL shell](use-the-built-in-sql-client.html) inside it, using the `vip` endpoint as the `--host`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ docker run -it {{ page.release_info.docker_image }}:{{ page.release_info.version }}  sql --insecure --host=pg.cockroachdb.l4lb.thisdcos.directory
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

## Step 4. Monitor the cluster

To access the cluster's [Admin UI](explore-the-admin-ui.html), you can [use a DC/OS tunnel to run an HTTP proxy](https://docs.mesosphere.com/1.10/developing-services/tunnel/#using-dcos-tunnel):

1. Install the DC/OS tunnel package:

     ~~~ shell
     $ dcos package install tunnel-cli --cli
     ~~~

2. Start a DC/OS tunnel:

    ~~~ shell
    $ sudo dcos tunnel http
    ~~~

3. In a browser, go to <a href="http.cockroachdb.l4lb.thisdcos.directory.mydcos.directory" data-proofer-ignore>http://http.cockroachdb.l4lb.thisdcos.directory.mydcos.directory</a>.

## Step 5. Scale the cluster

The default `cockroachdb` service creates a 3-node CockroachDB cluster. You can add nodes to the cluster after the service has been launched by updating the Scheduler process:

1. In the DC/OS UI, go to the **Services** table.
2. Select the **cockroachdb** service.
3. In the upper right, select **Edit**.
4. Select **Environment**.
5. Update the `NODE_COUNT` variable to match the number of CockroachDB nodes you want.
6. Click **Review & Run** and then **Run Service**.

The Scheduler process will restart with the new configuration and will validate any detected changes. To check that nodes were successfully added to the cluster, go back to the Admin UI, view **Node List**, and check for the new nodes.

Alternately, you can [SSH to the DC/OS master node](https://docs.mesosphere.com/1.10/administering-clusters/sshcluster/) and then run the [`cockroach node status`](view-node-details.html) command in a temporary container, again using the `vip` endpoint as the `--host`:

{% include copy-clipboard.html %}
~~~ shell
$ dcos node ssh --master-proxy --leader
~~~

{% include copy-clipboard.html %}
~~~ shell
$ docker run -it {{ page.release_info.docker_image }}:{{ page.release_info.version }} node status --all --insecure --host=pg.cockroachdb.l4lb.thisdcos.directory
~~~

~~~
+----+--------------------------------------------------------------------------+----------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+------------------+-----------------------+--------+--------------------+-----------------------+
| id |                                 address                                  | build                |     updated_at      |     started_at      | live_bytes | key_bytes | value_bytes | intent_bytes | system_bytes | replicas_leaders | replicas_leaseholders | ranges | ranges_unavailable | ranges_underreplicated |
+----+--------------------------------------------------------------------------+----------------------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+------------------+-----------------------+--------+--------------------+-----------------------+
|  1 | cockroachdb-0-node-init.cockroachdb.autoip.dcos.thisdcos.directory:26257 | {{ page.release_info.version }} | 2017-12-11 20:59:12 | 2017-12-11 19:14:42 |   41183973 |      1769 |    41187432 |            0 |         6018 |                2 |                     2 |      2 |                  0 |                      0 |
|  2 | cockroachdb-1-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257 | {{ page.release_info.version }} | 2017-12-11 20:59:12 | 2017-12-11 19:14:52 |     115448 |     71037 |      209282 |            0 |         6218 |                4 |                     4 |      4 |                  0 |                      0 |
|  3 | cockroachdb-2-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257 | {{ page.release_info.version }} | 2017-12-11 20:59:03 | 2017-12-11 19:14:53 |     120325 |     72652 |      217422 |            0 |         6732 |                4 |                     3 |      4 |                  0 |                      0 |
|  4 | cockroachdb-3-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257 | {{ page.release_info.version }} | 2017-12-11 20:59:03 | 2017-12-11 20:21:43 |   41248030 |     79147 |    41338632 |            0 |         6569 |                1 |                     1 |      1 |                  0 |                      0 |
|  5 | cockroachdb-4-node-join.cockroachdb.autoip.dcos.thisdcos.directory:26257 | {{ page.release_info.version }} | 2017-12-11 20:59:04 | 2017-12-11 20:56:54 |   41211967 |     30550 |    41181417 |            0 |         6854 |                1 |                     1 |      1 |                  0 |                      0 |
+----+--------------------------------------------------------------------------+--------+---------------------+---------------------+------------+-----------+-------------+--------------+--------------+------------------+-----------------------+--------+--------------------+-------------+-----------------------+
(5 rows)
~~~

## Step 6. Maintain the cluster

Choose the relevant maintenance task:

- [Update Configurations](#update-configurations)
- [Restart a Node](#restart-a-node)
- [Replace a Node](#replace-a-node)
- [Troubleshoot (Access Logs)](#troubleshoot-access-logs)
- [Backup and Restore](#backup-and-restore)

### Update configurations

In addition to adding nodes, you can change the [CPU and Memory requirements](https://github.com/cockroachdb/dcos-cockroachdb-service#resizing-a-node) for nodes, update [placement constraints](https://github.com/cockroachdb/dcos-cockroachdb-service#resizing-a-node), and make changes to [other service settings](https://github.com/cockroachdb/dcos-cockroachdb-service#service-settings). Just follow the instructions in the previous step, but change the environment variable for the update you want to make.

- After making a change, the scheduler will restart and automatically deploy any detected changes to the service, one node at a time. For example, a given change will first be applied to `cockroachdb-0`, then `cockroachdb-1`, and so on.
- Nodes are configured with a "Readiness check" to ensure that the underlying service appears to be in a healthy state before applying a given change to the next node in the sequence. However, this basic check is not foolproof and reasonable care should be taken to ensure that a given configuration change will not negatively affect the behavior of the service.

### Restart a Node

You can restart a node while keeping it at its current location with its current persistent volume data. This may be thought of as similar to restarting a system process, but it also deletes any data that is not on a persistent volume.

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

You can move a node to a new system and discard the persistent volumes at the prior system to be rebuilt at the new system. Nodes are not moved automatically, so this step must be performed, for example, before a system is offlined or when a system has already been offlined.

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

### Troubleshoot (access logs)

Logs for the Scheduler and service (i.e., CockroachDB) can be viewed from the DC/OS web interface.

- Scheduler logs are useful for determining why a node isn't being launched (this is under the purview of the Scheduler).
- Node logs are useful for examining problems in the service itself, i.e., CockroachDB.

In all cases, logs are generally piped to files named stdout and/or stderr.

To view logs for a given node:

1. In the DC/OS UI, go to the **Services** table.
2. Select the **cockroachdb** service.
3. In the list of tasks for the service, select the task to be examined. The Scheduler is named after the service, and nodes are `cockroachdb-0-node-init` or `cockroachdb-#-node-join`.
4. In the task details, go to the **Logs** tab.

### Backup and restore

The `cockroachdb` DC/OS service provides an easy way use CockroachDB's [`cockroach dump`](sql-dump.html) command to back up data on a per-database basis to an S3 bucket and to restore data from such a backup. Note that using datastores other than S3 is not yet supported.

{{site.data.alerts.callout_success}}If you need to back up to/restore from datasources other than S3, or you have a very large database and need <a href="backup.html">faster backups</a>, <a href="backup.html#incremental-backups">incremental backups</a>, or a <a href="restore.html">faster, distributed restore process</a>, consider contacting Cockroach Labs about an <a href="https://www.cockroachlabs.com/pricing/">enterprise license</a>.{{site.data.alerts.end}}

#### Backup

To backup the tables in a database, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ dcos cockroachdb backup [<flags>] <database> <s3-bucket>
~~~

You can configure the communication with S3 using the following optional flags:

Flag | Description
-----|------------
`--aws-access-key` | AWS Access Key
`--aws-secret-key` | AWS Secret Key
`--s3-dir` | AWS S3 target path
`--s3-backup-dir` | Target path within s3-dir
`--region` | AWS region

By default, the AWS access and secret keys will be pulled from your environment via the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables, respectively. You must either have these environment variables defined or specify the flags for the backup to work.

Make sure that you provision your nodes with enough disk space to perform a backup. The backups are stored on disk before being uploaded to S3, and will take up as much space as the data currently in the tables, so you'll need half of your total available space to be free to backup every keyspace at once.

#### Restore

To restore cluster data, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ dcos cockroachdb restore [<flags>] <database> <s3-bucket> <s3-backup-dir>
~~~

You can configure the communication with S3 using the following optional flags to the CLI command:

Flag | Description
-----|------------
`--aws-access-key` | AWS Access Key
`--aws-secret-key` | AWS Secret Key
`--s3-dir` | AWS S3 target path
`--s3-backup-dir` | Target path within s3-dir
`--region` | AWS region

By default, the AWS access and secret keys will be pulled from your environment via the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables, respectively. You must either have these environment variables defined or specify the flags for the backup to work.

## Step 7. Stop the cluster

To shut down the CockroachDB cluster:

1. Uninstall the `cockroachdb` service:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ MY_SERVICE_NAME=cockroachdb
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos package uninstall --app-id=$MY_SERVICE_NAME $MY_SERVICE_NAME
    ~~~

2. If you're using DC/OS version 1.9, use the following command to clean up remaining reserved resources with the framework cleaner script, [`janitor.py`](https://docs.mesosphere.com/1.9/deploying-services/uninstall/#framework-cleaner). Note that this step is not needed for DC/OS 1.10.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dcos node ssh --master-proxy --leader "docker run mesosphere/janitor /janitor.py \
    -r $MY_SERVICE_NAME-role \
    -p $MY_SERVICE_NAME-principal \
    -z dcos-service-$MY_SERVICE_NAME"
    ~~~

3. Uninstall DC/OS. If you used AWS CloudFormation, see [Uninstalling DC/OS on AWS EC2](https://docs.mesosphere.com/1.10/installing/oss/cloud/aws/removeaws/).

## See also

{% include {{ page.version.version }}/prod-deployment/prod-see-also.md %}
