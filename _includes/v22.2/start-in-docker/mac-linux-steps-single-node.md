When you use the `cockroach start-single-node` command to start a single-node cluster with Docker, additional features are available to help with testing and development.

{{site.data.alerts.callout_danger}}
Single-node clusters are not highly available or fault tolerant. They are not appropriate for production use.
{{site.data.alerts.end}}

- You can optionally set the following [Docker environment variables](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file) to create a database and user automatically and to set a password for the user.
  - `COCKROACH_DATABASE`
  - `COCKROACH_USER`
  - `COCKROACH_PASSWORD`

      To prevent loss of a cluster's existing data, the environment variables are used only if the `/cockroach/cockroach-data` directory within the container is empty.

- You can optionally mount a directory of initialization scripts into the `docker-entrypoint-initdb.d` directory within the container. These scripts are run after CockroachDB starts and after the database and user (if specified as environment variables) have been created. The scripts run in the alphanumeric sort order imposed by your locale. The init scripts are run only if the `/cockroach/cockroach-data` directory within the container is empty.

During local development and testing, you can re-initialize the default database, user, and password by deleting the contents of `/cockroach/cockroach-data` within the running container and then restarting the container.

This section shows how to start a single-node cluster that uses these features.

### Step 1. Create a Docker volume for the node

Cockroach Labs recommends that you store cluster data in a Docker volume rather than in the storage layer of the running container. Otherwise, if a Docker container is inadvertently deleted, its data is inaccessible.

To create the [Docker volume](https://docs.docker.com/storage/volumes/) where the cluster will store its data, run the following:

{% include_cached copy-clipboard.html %}
~~~ shell
docker volume create roach-single
~~~

### Step 2. Start the cluster

This section shows how to start a single-node cluster that:

- Stores its data in the `roach-single` volume on the Docker host, which is mounted on the `/cockroach/cockroach-data` directory within the container.
- If the `/cockroach/cockroach-data` directory within the container is empty, creates the specified database, user, and password automatically.

    {{site.data.alerts.callout_success}}
    Instead of specifying each value directly by using the `-e` or `--env` flag, you can store them in a file on the Docker host. Use one key-value pair per line and set the `--env-file` flag to the file's path.
    {{site.data.alerts.end}}

- Bind-mounts the `~/init-scripts` directory on the Docker host onto the `/docker-entrypoint-initdb.d` directory within the container. Initialization scripts stored in this directory are run after CockroachDB starts and the default database, user, and password are initialized.</li>
- Accepts database client connections on hostname `roach-single` on port 26257.</li>
- Accepts connections to the DB Console on hostname `roach-single` on port 8080.</li>

1. Start the cluster node.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker run -d \
              --env COCKROACH_DATABASE={DATABASE_NAME} \
              --env COCKROACH_USER={USER_NAME} \
              --env COCKROACH_PASSWORD={PASSWORD} \
              --name=roach-single \
              --hostname=roach-single \
              -p 26257:26257 -p 8080:8080 \
              -v "roach-single:/cockroach/cockroach-data" \
              -v "~/init-scripts:/docker-entrypoint-initdb.d" \
              cockroachdb/cockroach:latest start-single-node
    ~~~

    By default, a `certs` directory is created and CockroachDB starts in secure mode. To prevent this, add the `--insecure` flag after the `start-single-node` sub-command.

    {{site.data.alerts.callout_info}}
    The `COCKROACH_DATABASE`, `COCKROACH_USER`, and `COCKROACH_PASSWORD` environment variables and the contents of the `/docker-entrypoint-initdb.d` directory are ignored if you use `cockroach start` rather than `cockroach start-single-node`. They are also ignored if data exists in the `/cockroach/cockroach-data` directory within the container.
    {{site.data.alerts.end}}

    Docker adds a DNS entry that resolves the hostname `roach-single` to the container's IP address in Docker's default network. The following examples use this hostname.

1. After the cluster is initialized, the cluster node prints helpful [startup details](cockroach-start.html#standard-output) to its log, including the DB Console URL and the SQL connection string. To retrieve `roach-single`'s startup details:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker exec -it roach-single grep 'node starting' cockroach-data/logs/cockroach.log -A 11
    ~~~

    ~~~ shell
    CockroachDB node starting at 2022-09-28 14:35:27.495508396 +0000 UTC m=+1.370085757 (took 0.5s)
    build:               CCL {{ page.page_version }} @ 2022/09/26 18:49:07 (go1.19.1)
    webui:               https://172.18.0.3:8080
    sql:                 postgresql://root@172.18.0.3:26257/defaultdb?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt
    sql (JDBC):          jdbc:postgresql://172.18.0.3:26257/defaultdb?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt&user=root
    RPC client flags:    /cockroach/cockroach <client cmd> --host=172.18.0.3:26257 --certs-dir=certs
    logs:                /cockroach/cockroach-data/logs
    temp dir:            /cockroach/cockroach-data/cockroach-temp2611102055
    external I/O path:   /cockroach/cockroach-data/extern
    store[0]:            path=/cockroach/cockroach-data
    storage engine:      pebble
    clusterID:           60f29a4e-1c87-4b0c-805d-eb73460766b1
    status:              initialized new cluster
    nodeID:              1
    ~~~

### Step 3. Connect to the cluster

1. After the cluster is initialized, you can connect to it, run tests on it, and stop it using the same instructions as a multi-node cluster. To monitor the cluster node's logs interactively:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker log roach-single --follow
    ~~~

    To stop monitoring the logs, press Ctrl+C to exit the `docker log` command.

1. To connect to the cluster interactively using the `cockroach sql` command-line interface, set `--url` cluster's SQL connection string, which is printed next to `sql:` in the cluster's startup details. You can replace the IP address with the hostname of the Docker container so that the script continues to work if the IP address changes. To run `cockroach sql` on the `roach-single` cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker exec -it roach-single ./cockroach sql --url="postgresql://root@roach-single:26257/defaultdb?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt"
    ~~~

1. To connect to the cluster using DB Console in your web browser, navigate to the address printed next to `webui:` in the cluster's startup details. You can replace the IP address with the hostname of the Docker container. To connect to the `roach-single` cluster, navigate to [https://roach-single:8080/](https://roach-single:8080/) for a secure cluster or [http://roach-single:8080/](http://roach-single:8080/) for an insecure cluster.

### Step 4. Stop the cluster

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
