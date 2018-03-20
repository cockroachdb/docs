---
title: Node Map 
toc: false
---

The **Node Map** view visualizes the geographical configuration of a multi-regional cluster by plotting the node locations on a world map. The **Node Map** also provides real-time cluster metrics, with the ability to drill down to individual nodes to monitor and troubleshoot the cluster health and performance. 

<div id="toc"></div>

{{site.data.alerts.callout_info}}The <b>Node Map</b> is an <a href="enterprise-licensing.html">enterprise-only</a> feature. However, you can <a href="https://www.cockroachlabs.com/pricing/request-a-license/">request a trial license</a>  to try out the <b>Node Map</b> view. {{site.data.alerts.end}}

## Why Use the Node Map View

The **Node Map View** helps you monitor the cluster health and performance, ensure effective resource utilization, and troubleshoot cluster issues:

### Monitor Cluster Health and Performance

The **Node Map** view provides:

- A high-level graphical overview of how the cluster is configured, which helps you understand how the available hardware is servicing your users. 
- Important cluster health metrics, such as Capacity and CPU utilization, QPS, and uptime.

### Ensure Effective Resource Utilization

The **Node Map** view helps you:

- Confirm that the database is balanced and you are utilizing resources effectively. This helps you provision hardware and plan ahead for scale.
- Ensure that storage capacity is balanced across the disks available to the extent that they match the zone configs.
- Check if there is resource congestion anywhere (for example certain nodes going beyond capacity).

### Troubleshoot the Cluster

The **Node Map** view helps you identify and preempt any scenarios that might cause downtime, service issues, or otherwise negatively impact cluster health. The **Node Map** view helps you:

- Monitor disk utilization to know if you need to add more storage capacity.
- Identify dead nodes in the cluster.
- Be informed about unavailable or under-replicated ranges.
- Confirm that configuration changes were persisted to the cluster.
- Observe QPS across nodes to ensure that queries are rerouted to live nodes if a node failure occurs.

## Configure and Navigate the Node Map

To configure the **Node Map**, you need to start the cluster with the correct `--locality` flags and assign the latitudes and longitudes for each region.

{{site.data.alerts.callout_info}}The <b>Node Map</b> won't be displayed until all regions are assigned the corresponding latitudes and longitudes. {{site.data.alerts.end}}

Consider a four-node geo-distributed cluster with the following configuration:

|  Node | Region | Datacenter |
|  ------ | ------ | ------ |
|  Node1 | us-east | us-east-1 |
|  Node2 | us-east | us-east-1 |
|  Node3 | us-west | us-west-1 |
|  Node4 | eu-west | eu-west-1 |

#### Step 1. Ensure the CockroachDB version is 2.0 or higher

~~~ shell
$ cockroach version
~~~

If not, [upgrade to CockroachDB v2.0](upgrade-cockroach-version.html).

#### Step 2. Start the nodes with the correct `--locality` flags

In a new terminal, start Node 1:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=region=us-east,datacenter=us-east-1  \
--store=node1 \
--host=localhost \
--port=26257 \
--http-port=8080 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

In a new terminal, start Node 2:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=region=us-east,datacenter=us-east-1 \
--store=node2 \
--host=localhost \
--port=26258 \
--http-port=8081 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

In a new terminal, start Node 3:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=region=us-west,datacenter=us-west-1 \
--store=node3 \
--host=localhost \
--port=26259 \
--http-port=8082 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

In a new terminal, start Node 4:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=region=eu-west,datacenter=eu-west-1 \
--store=node4 \
--host=localhost \
--port=26260 \
--http-port=8083 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

In a new terminal, use the [`cockroach init`](initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure
~~~

#### Step 3. [Set the enterprise license](enterprise-licensing.html)

#### Step 4. Set the latitudes and longitudes of each region

Launch the built-in SQL client:

{% include copy-clipboard.html %}
~~~ sql
$ cockroach sql --insecure --host=localhost
~~~

Insert the latitudes and longitudes of each region into the `systems.locations` table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO system.locations VALUES
  ('region', 'us-east', 40.367474, -82.996216), 
  ('region', 'us-west', 43.8041334, -120.55420119999997), 
  ('region', 'eu-west', 48.856614, 2.3522219000000177);
~~~

{{site.data.alerts.callout_info}}The <b>Node Map</b> won't be displayed until all regions are assigned the corresponding latitudes and longitudes. {{site.data.alerts.end}}

To get the latitudes and longitudes of AWS regions, see [Locations Co-ordinates for Reference](#location-co-ordinates-for-reference).

#### Step 5. Verify the settings 

Navigate to `https://localhost:8080/#/reports/localities` and use the **Localities** table to verify that the latitudes and longitudes correspond to the correct regions.

#### Step 6. View the Node Map

[Navigate to the **Overview page**](admin-ui-cluster-overview.html) to view the **Node Map**.

#### Step 7. Navigate the Node Map

Suppose you want to navigate to Node 2, which is in datacenter `us-east-1` in the region `us-east`. To navigate to Node 2:

1. Click on map component marked as **region=us-east** on the Node Map. The datacenter view is displayed.
2. Click on the datacenter component marked as **datacenter=us-east-1**. The individual node components are displayed.
3. To navigate back to the cluster view, either click on **Cluster** in the bread-crumb trail at the top of the Node Map, or click **Up to region=us-east** and then click **Up to Cluster** in the lower left-hand side of the Node Map.

## Understand the Node Map Components

### Node component

<img src="{{ 'images/admin-ui-node-components.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

### Region component

<img src="{{ 'images/admin-ui-region-component.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

## Troubleshoot the Node Map

### Nodes do not show up on the Node Map

The **Node Map** won't be displayed until all nodes have localities and are assigned the corresponding latitudes and longitudes. To verify if you have assigned localities as well as latitude and longitudes assigned to all nodes, navigate to the Localities debug page (`https://localhost:8080/#/reports/localities`) in the Admin UI.

The Localities debug page displays the following: 

- Localities configuration that you set up while starting the nodes with the `--locality` flags. 
- Nodes corrsponding to each locality.
- Latitude and longitude coordinates for each locality/node.

On the page, ensure that every node has a locality as well as latitude and longitude coordinates assigned to them.

### Unable to assign latitude/longitude coordinates to localities

One scenario where you would be unable to assign latitude/longitude coordinates to localities is if components of your localities have the same name. For example, consider the following configuration:

|  Node | Region | Datacenter |
|  ------ | ------ | ------ |
|  Node1 | us-east | datacenter-1 |
|  Node2 | us-west | datacenter-1 |

In this case, if you try to set the latitude/longitude coordinates to the datacenter components of the localities, you will get the "primary key exists" error and the Node Map won't be displayed. You can, however, set the latitude/longitude coordinates to the region components of the localities, and the Node Map will be displayed.

### Capacity displayed is more than capacity configured

If you are running multiple nodes on a single machine (not recommended), this value may be incorrect. This is because when multiple nodes are running on a single machine, the machine's hard disk is treated as separate stores for each node, while in reality, only one hard disk is used for all nodes. The Capacity Used is then displayed as the hard disk capacity used multiplied by the number of nodes on the machine.

## Location Coordinates for Reference

|  **Location** | **SQL Statement** |  
|  ------ | ------ | ------ | ------ |
|  US East (N. Virginia) | `INSERT into system.locations VALUES ('region', 'us-east-1', 37.478397, -76.453077)`|
|  US East (Ohio) | `INSERT into system.locations VALUES ('region', 'us-east-2', 40.417287, -76.453077)` |
|  US Central (Iowa) | `INSERT into system.locations VALUES ('region', 'us-central', 42.032974, -93.581543)` |
|  US West (N. California) | `INSERT into system.locations VALUES ('region', 'us-west-1', 38.837522, -120.895824)` |
|  US West (Oregon) | `INSERT into system.locations VALUES ('region', 'us-west-2', 43.804133, -120.554201)` |
|  Canada (Central) | `INSERT into system.locations VALUES ('region', 'ca-central-1', 56.130366, -106.346771)` |
|  EU (Frankfurt) | `INSERT into system.locations VALUES ('region', 'eu-central-1', 50.110922, 8.682127)` |
|  EU (Ireland) | `INSERT into system.locations VALUES ('region', 'eu-west-1', 53.142367, -7.692054)` |
|  EU (London) | `INSERT into system.locations VALUES ('region', 'eu-west-2', 51.507351, -0.127758)` |
|  EU (Paris) | `INSERT into system.locations VALUES ('region', 'eu-west-3', 48.856614, 2.352222)` |
|  Asia Pacific (Tokyo) | `INSERT into system.locations VALUES ('region', 'ap-northeast-1', 35.689487, 139.691706)` |
|  Asia Pacific (Seoul) | `INSERT into system.locations VALUES ('region', 'ap-northeast-2', 37.566535, 126.977969)` |
|  Asia Pacific (Osaka-Local) | `INSERT into system.locations VALUES ('region', 'ap-northeast-3', 34.693738, 135.502165)` |
|  Asia Pacific (Singapore) | `INSERT into system.locations VALUES ('region', 'ap-southeast-1', 1.352083, 103.819836)` |
|  Asia Pacific (Sydney) | `INSERT into system.locations VALUES ('region', 'ap-southeast-2', -33.86882, 151.209296)` |
|  Asia Pacific (Mumbai) | `INSERT into system.locations VALUES ('region', 'ap-south-1', 19.075984, 72.877656)` |
|  South America (São Paulo) | `INSERT into system.locations VALUES ('region', 'sa-east-1', -23.55052, -46.633309)` |