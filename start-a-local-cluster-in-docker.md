---
title: Start a Cluster in Docker
summary: Run a multi-node CockroachDB cluster across multiple Docker containers on a single host.
toc: false
asciicast: true
---

<script>
$(document).ready(function(){
    
    //detect os and display corresponding tab by default
    if (navigator.appVersion.indexOf("Mac")!=-1) { 
        $('#os-tabs').find('button').removeClass('current');
        $('#mac').addClass('current');
        toggleMac(); 
    }
    if (navigator.appVersion.indexOf("Linux")!=-1) { 
        $('#os-tabs').find('button').removeClass('current');
        $('#linux').addClass('current');
        toggleLinux(); 
    }
    if (navigator.appVersion.indexOf("Win")!=-1) { 
        $('#os-tabs').find('button').removeClass('current');
        $('#windows').addClass('current');
        toggleWindows(); 
    }

    var install_option = $('.install-option'), 
        install_button = $('.install-button');

    install_button.on('click', function(e){
      e.preventDefault();
      var hash = $(this).prop("hash");

      install_button.removeClass('current');
      $(this).addClass('current');
      install_option.hide();
      $(hash).show();

    });

    //handle click event for os-tab buttons
    $('#os-tabs').on('click', 'button', function(){
        $('#os-tabs').find('button').removeClass('current');
        $(this).addClass('current');

        if($(this).is('#mac')){ toggleMac(); }
        if($(this).is('#linux')){ toggleLinux(); }
        if($(this).is('#windows')){ toggleWindows(); }
    });

    function toggleMac(){
        $(".mac-button:first").trigger('click');
        $("#macinstall").show();
        $("#linuxinstall").hide();
        $("#windowsinstall").hide();
    }

    function toggleLinux(){
        $(".linux-button:first").trigger('click');
        $("#linuxinstall").show();
        $("#macinstall").hide();
        $("#windowsinstall").hide();
    }

    function toggleWindows(){
        $("#windowsinstall").show();
        $("#macinstall").hide();
        $("#linuxinstall").hide(); 
    }
});
</script>

<div id="os-tabs" class="clearfix">
    <button id="mac" class="current">Mac</button>
    <button id="linux">Linux</button>
    <button id="windows">Windows</button>
</div>

Once you've [installed the official CockroachDB Docker image](install-cockroachdb.html), it's simple to run a multi-node cluster across multiple Docker containers on a single host, using Docker volumes to persist node data.

{{site.data.alerts.callout_danger}}Running a stateful application like CockroachDB in Docker is more complex and error-prone than most uses of Docker and is not recommended for production deployments. To run a physically distributed cluster in containers, use an orchestration tool like Kubernetes or Docker Swarm. See <a href="orchestration.html">Orchestration</a> for more details.{{site.data.alerts.end}}

<!--<div id="toc"></div>-->

<div id="macinstall" markdown="1">
{% include start_in_docker/mac-linux-steps.md %}
</div>

<div id="linuxinstall" markdown="1">
{% include start_in_docker/mac-linux-steps.md %}
</div>

<div id="windowsinstall" markdown="1">
## Step 1. Create a bridge network

Since you'll be running multiple Docker containers on a single host, with one CockroachDB node per container, you need to create what Docker refers to as a [bridge network](https://docs.docker.com/engine/userguide/networking/#/a-bridge-network). The bridge network will enable the containers to communicate as a single cluster while keeping them isolated from external networks. 

~~~ powershell
PS C:\Users\username> docker network create -d bridge roachnet
~~~

We've used `roachnet` as the network name here and in subsequent steps, but feel free to give your network any name you like.

## Step 2. Start your first container/node

{{site.data.alerts.callout_info}}Be sure to replace <code>&#60;username&#62;</code> in the <code>-v</code> flag with your actual username.{{site.data.alerts.end}}

~~~ powershell
PS C:\Users\username> docker run -d \
--name=roach1 \
--hostname=roach1 \
--net=roachnet \
-p 26257:26257 -p 8080:8080 \
-v "//c/Users/<username>/cockroach-data/roach1:/cockroach/cockroach-data" \
cockroachdb/cockroach:{{site.data.strings.version}} start --insecure
~~~

This command creates a container and starts the first CockroachDB node inside it. Let's look at each part:

- `docker run`: The Docker command to start a new container.
- `-d`: This flag runs the container in the background so you can continue the next steps in the same shell. 
- `--name`: The name for the container. This is optional, but a custom name makes it significantly easier to reference the container in other commands, for example, when opening a Bash session in the container or stopping the container. 
- `--hostname`: The hostname for the container. You will use this to join other containers/nodes to the cluster.
- `--net`: The bridge network for the container to join. See step 1 for more details.
- `-p 26257:26257 -p 8080:8080`: These flags map the default port for inter-node and client-node communication (`26257`) and the default port of HTTP requests from the Admin UI (`8080`) from the container to the host. This enables inter-container communication and makes it possible to call up the Admin UI from a browser.
- `-v "//c/Users/<username>/cockroach-data/roach1:/cockroach/cockroach-data"`: This flag mounts a host directory as a data volume. This means that data and logs for this node will be stored in `Users/<username>/cockroach-data/roach1` on the host and will persist after the container is stopped or deleted. For more details, see Docker's <a href="https://docs.docker.com/engine/tutorials/dockervolumes/#/mount-a-host-directory-as-a-data-volume">Mount a host directory as a data volume</a> topic.
- `cockroachdb/cockroach:{{site.data.strings.version}} start --insecure`: The CockroachDB command to [start a node](start-a-node.html) in the container in insecure mode. 

  {{site.data.alerts.callout_success}}By default, each node's cache is limited to 25% of available memory. This default is reasonable when running one container/node per host. When running multiple containers/nodes on a single host, however, it may lead to out of memory errors, especially when testing against the cluster in a serious way. To avoid such errors, you can manually limit each node's cache size by setting the <a href="start-a-node.html#flags"><code>--cache</code></a> flag in the <code>start</code> command.{{site.data.alerts.end}}

## Step 3. Start additional containers/nodes

{{site.data.alerts.callout_info}}Again, be sure to replace <code>&#60;username&#62;</code> in the <code>-v</code> flag with your actual username.{{site.data.alerts.end}}

~~~ powershell
# Start the second container/node:
PS C:\Users\username> docker run -d \
--name=roach2 \
--hostname=roach2 \
--net=roachnet \
-P \
-v "//c/Users/<username>/cockroach-data/roach2:/cockroach/cockroach-data" \
cockroachdb/cockroach:{{site.data.strings.version}} start --insecure --join=roach1

# Start the third container/node:
PS C:\Users\username> docker run -d \
--name=roach3 \
--hostname=roach3 \
--net=roachnet \
-P \
-v "//c/Users/<username>/cockroach-data/roach3:/cockroach/cockroach-data" \
cockroachdb/cockroach:{{site.data.strings.version}} start --insecure --join=roach1
~~~

These commands add two more containers and start CockroachDB nodes inside them, joining them to the first node. There are only a few differences to note from step 2:

- `-P`: This flag maps exposed ports to random ports on the host. This random mapping is fine since we've already mapped the relevant ports for the first container.
- `-v`: This flag mounts a host directory as a data volume. Data and logs for these nodes will be stored in `Users/<username>/cockroach-data/roach2` and `Users/<username>/cockroach-data/roach3` on the host and will persist after the containers are stopped or deleted.
- `--join`: This flag joins the new nodes to the cluster, using the first container's `hostname`. Otherwise, all [`cockroach start`](start-a-node.html) defaults are accepted. Note that since each node is in a unique container, using identical default ports won’t cause conflicts.

## Step 4. Use the built-in SQL client

Use the `docker exec` command to start the [built-in SQL shell](use-the-built-in-sql-client.html) in the first container:

~~~ powershell
PS C:\Users\username> docker exec -it roach1 ./cockroach sql
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

Then run some [CockroachDB SQL statements](learn-cockroachdb-sql.html):

~~~ sql
> CREATE DATABASE bank;
~~~

~~~
CREATE DATABASE
~~~

~~~ sql
> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
~~~

~~~
CREATE TABLE
~~~

~~~ sql
> INSERT INTO bank.accounts VALUES (1, 1000.50);
~~~

~~~
INSERT 1
~~~

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

When you're done, use **CTRL + D**, **CTRL + C**, or `\q` to exit the SQL shell.

If you want to verify that the containers/nodes are, in fact, part of a single cluster, you can start the SQL shell in one of the other containers and check for the new `bank` database:

~~~ powershell
PS C:\Users\username> docker exec -it roach2 ./cockroach sql
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

~~~ sql
> SHOW DATABASES;
~~~

~~~
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+
~~~

## Step 5. Open the Admin UI

When you started the first container/node, you mapped the node's default HTTP port `8080` to port `8080` on the host. To check out the [Admin UI](explore-the-admin-ui.html) for your cluster, point your browser to that port on `localhost`, i.e., `http://localhost:8080`.

<img src="images/admin_ui.png" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 6.  Stop the cluster

Use the `docker stop` and `docker rm` commands to stop and remove the containers (and therefore the cluster):

~~~ powershell
# Stop the containers:
PS C:\Users\username> docker stop roach1 roach2 roach3

# Remove the containers:
PS C:\Users\username> docker rm roach1 roach2 roach3
~~~
</div>

## What's Next?

[Secure your cluster](secure-a-cluster.html) with authentication and encryption. You might also be interested in:

- [Manual Deployment](manual-deployment.html): How to run CockroachDB across multiple machines
- [Cloud Deployment](cloud-deployment.html): How to run CockroachDB in the cloud
- [Orchestration](orchestration.html): How to further automate CockroachDB with orchestration tools
