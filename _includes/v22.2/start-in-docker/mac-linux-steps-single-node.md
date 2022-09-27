When you use the `cockroach start-single-node` command to start a single-node cluster with Docker, additional features are available to help with testing and development.

{{site.data.alerts.callout_danger}}
Single-node clusters are not highly-available or fault-tolerant. They are not appropriate for production use.
{{site.data.alerts.end}}

- You can optionally set the following [Docker environment variables](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file) to create a database and user automatically and to set a password for the user.
  - `COCKROACH_DATABASE`
  - `COCKROACH_USER`
  - `COCKROACH_PASSWORD`

  To prevent data loss, the environment variables are ignored if the `/cockroach/cockroach-data` directory within the container is not empty. To re-initialize the default database, user, and password from the environment variable values, delete the contents of `/cockroach/cockroach-data` within the running container.

- You can optionally mount a directory of initialization scripts into the `docker-entrypoint-initdb.d` directory within the container. These scripts are run after CockroachDB starts and after the database and user (if specified) have been created. The scripts run in the alphanumeric sort order imposed by your locale.

This section shows how to start a single-node cluster that uses these features.

### Step 1. Create Docker volumes for the node

Cockroach Labs recommends that you store cluster data in a Docker volume rather than in the storage layer of the running container. Otherwise, if a Docker container is inadvertently deleted, its data is inaccessible.

To create the [Docker volume](https://docs.docker.com/storage/volumes/) where the cluster will store its data:

{% include_cached copy-clipboard.html %}
~~~ shell
docker volume create roach-single
~~~



### Step 2. Start the cluster

1. Start the cluster node.

    The following command starts a single-node cluster that:
 
    - Stores its data in the `roach-single` volume on the Docker host, which is mounted on the `/cockroach/cockroach-data` directory within the container.
    - If the `/cockroach/cockroach-data` within the container is empty, the specified database, user, and password are created automatically. Instead of specifying each value directly by using the `-e` or `--env` flag, you can store them in a file on the Docker host. Use one key-value pair per line and set the `--env-file` flag to the file's path.
    - Bind-mounts the `~/init-scripts` directory on the Docker host onto the `/docker-entrypoint-initdb.d` directory within the container. Initialization scripts stored in this directory are run after CockroachDB starts and the default database, user, and password are initialized.
    - Accepts database client connections on IP address 172.18.0.3 (which resolves to the hostname `roach-single` within the Docker container) on port 26257.
    - Accepts connections to the DB Console on IP address 172.18.0.3 (which resolves to the hostname `roach-single` within the Docker container) on port 8080.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker run -d \
              --env COCKROACH_DATABASE={DATABASE_NAME} \
              --env COCKROACH_USER={USER_NAME} \
              --env COCKROACH_PASSWORD={PASSWORD} \
              --name=roach-single \
              --hostname=roach-single \
              --ip=172.18.0.3 \
              --advertise-addr=172.18.0.3 \
              -p 26257:26257 -p 8080:8080 \
              -v "roach-single:/cockroach/cockroach-data" \
              -v "~/init-scripts:/docker-entrypoint-initdb.d" \
              cockroachdb/cockroach:latest start-single-node
    ~~~

    By default, a `certs` directory is created and CockroachDB starts in secure mode. To prevent this, add the `--insecure` flag after the `start-single-node` sub-command.

    {{site.data.alerts.callout_info}}
    The `COCKROACH_DATABASE`, `COCKROACH_USER`, and `COCKROACH_PASSWORD` environment variables and the contents of the `/docker-entrypoint-initdb.d` directory are ignored if you use `cockroach start` rather than `cockroach start-single-node`. They are also ignored if the `/cockroach/cockroach-data` directory within the container is not empty.
    {{site.data.alerts.end}}

1. Perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker exec -it roach-single ./cockroach init --insecure
    ~~~

    You'll see the following message:

    ~~~
    Cluster successfully initialized
    ~~~

    At this point, the cluster node also prints helpful [startup details](cockroach-start.html#standard-output) to its log. For example, the following command retrieves node 1's startup details:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker exec -it roach-single grep 'node starting' cockroach-data/logs/cockroach.log -A 11
    ~~~

    The output will look something like this:

    ~~~
    CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }}
    build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}} (go1.12.6)
    webui:               http://roach-single:8080
    sql:                 postgresql://root@roach-single:26257?sslmode=disable
    client flags:        /cockroach/cockroach <client cmd> --host=roach-single:26257
    logs:                /cockroach/cockroach-data/logs
    temp dir:            /cockroach/cockroach-data/cockroach-temp273641911
    external I/O path:   /cockroach/cockroach-data/extern
    store[0]:            path=/cockroach/cockroach-data
    status:              initialized new cluster
    clusterID:           1a705c26-e337-4b09-95a6-6e5a819f9eec
    nodeID:              1
    ~~~

1. After the cluster is initialized, you can connect to it, run tests on it, and stop it using the same instructions as a multi-node cluster. To monitor the cluster node's logs:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker log roach-single --follow
    ~~~

### Step 3. Stop the cluster

1. Use the `docker stop` and `docker rm` commands to stop and remove the container (and therefore the single-node cluster):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker stop roach-single
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker rm roach-single
    ~~~

1. If you do not plan to restart the cluster, you can also remove the Docker volume that contains the cluster's data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker volume rm roach-single
    ~~~