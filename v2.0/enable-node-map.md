---
title: Enable the Node Map
summary: Learn how to enable the node map in the Admin UI.
toc: false
---

The **Node Map** visualizes the geographical configuration of a multi-regional cluster by plotting the node localities on a world map. The **Node Map** also provides real-time cluster metrics, with the ability to drill down to individual nodes to monitor and troubleshoot the cluster health and performance.

This page walks you through the process of setting up and enabling the **Node Map**.

{{site.data.alerts.callout_info}}The <b>Node Map</b> is an <a href="enterprise-licensing.html">enterprise-only</a> feature. However, you can <a href="https://www.cockroachlabs.com/pricing/request-a-license/">request a trial license</a>  to enable the <b>Node Map</b>. {{site.data.alerts.end}}

<div id="toc"></div>

## Setting Up and Enabling the Node Map

To enable the **Node Map**, you need to start the cluster with the correct `--locality` flags and assign the latitudes and longitudes for each locality.

{{site.data.alerts.callout_info}}The <b>Node Map</b> won't be displayed until <i>all</i> nodes are started with the correct <code>--locality</code> flags and all localities are assigned the corresponding latitudes and longitudes. {{site.data.alerts.end}}

Consider a scenario of a four-node geo-distributed cluster with the following configuration:

|  Node | Region | Datacenter |
|  ------ | ------ | ------ |
|  Node1 | us-east-1 | us-east-1a |
|  Node2 | us-east-1 | us-east-1b |
|  Node3 | us-west-1 | us-west-1a |
|  Node4 | eu-west-1 | eu-west-1a |

### Step 1. Ensure the CockroachDB Version is 2.0 or Higher

~~~ shell
$ cockroach version
~~~

If not, [upgrade to CockroachDB v2.0](upgrade-cockroach-version.html).

### Step 2. Start (or Restart) the Nodes with the Correct `--locality` Flags

If you have a cluster running without the `--locality` flags set, restart the nodes with the correct `--locality` flags(add link to rolling restart page once it's created).

To start a new cluster with the correct `--locality` flags:

In a new terminal, start Node 1:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=region=us-east-1,datacenter=us-east-1a  \
--store=node1 \
--host=<node1 address> \
--port=26257 \
--http-port=8080 \
--join=<node1 address>:26257,<node2 address>:26258,<node3 address>:26259,<node4 address>:26260
~~~

In a new terminal, start Node 2:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=region=us-east-1,datacenter=us-east-1b \
--store=node2 \
--host=<node2 address> \
--port=26258 \
--http-port=8081 \
--join=<node1 address>:26257,<node2 address>:26258,<node3 address>:26259,<node4 address>:26260
~~~

In a new terminal, start Node 3:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=region=us-west-1,datacenter=us-west-1a \
--store=node3 \
--host=<node3 address> \
--port=26259 \
--http-port=8082 \
--join=<node1 address>:26257,<node2 address>:26258,<node3 address>:26259,<node4 address>:26260
~~~

In a new terminal, start Node 4:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=region=eu-west-1,datacenter=eu-west-1a \
--store=node4 \
--host=<node4 address> \
--port=26260 \
--http-port=8083 \
--join=<node1 address>:26257,<node2 address>:26258,<node3 address>:26259,<node4 address>:26260
~~~

In a new terminal, use the [`cockroach init`](initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure
~~~

### Step 3. [Set the Enterprise License](enterprise-licensing.html)

### Step 4. Set the Latitudes and Longitudes for the Localities

Launch the built-in SQL client:

{% include copy-clipboard.html %}
~~~ sql
$ cockroach sql --insecure --host=<address of any node>
~~~

Insert the latitudes and longitudes of each region into the `system.locations` table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO system.locations VALUES
  ('region', 'us-east', 40.367474, -82.996216),
  ('region', 'us-west', 43.8041334, -120.55420119999997),
  ('region', 'eu-west', 48.856614, 2.3522219000000177);
~~~

{{site.data.alerts.callout_info}}The <b>Node Map</b> won't be displayed until all regions are assigned the corresponding latitudes and longitudes. {{site.data.alerts.end}}

To get the latitudes and longitudes of common AWS/Azure/GC regions, see [Locations Coordinates for Reference](#location-coordinates-for-reference).

### Step 5. View the Node Map

[Open the **Overview page**](admin-ui-overview.html) to view the **Node Map**.

### Step 6. Navigate the Node Map

Let's say you want to navigate to Node 2, which is in datacenter `us-east-1a` in the `us-east-1` region. To navigate to Node 2:

1. Click on map component marked as **region=us-east-1** on the **Node Map**. The datacenter view is displayed.
2. Click on the datacenter component marked as **datacenter=us-east-1a**. The individual node components are displayed.
3. To navigate back to the cluster view, either click on **Cluster** in the bread-crumb trail at the top of the **Node Map**, or click **Up to region=us-east-1** and then click **Up to Cluster** in the lower left-hand side of the **Node Map**.

## Troubleshoot the Node Map

### Node Map Not Displayed

The **Node Map** won't be displayed until all nodes have localities and are assigned the corresponding latitudes and longitudes. To verify if you have assigned localities as well as latitude and longitudes assigned to all nodes, navigate to the Localities debug page (`https://<address of any node>:8080/#/reports/localities`) in the Admin UI.

The Localities debug page displays the following:

- Localities configuration that you set up while starting the nodes with the `--locality` flags.
- Nodes corresponding to each locality.
- Latitude and longitude coordinates for each locality/node.

On the page, ensure that every node has a locality as well as latitude/longitude coordinates assigned to them.

### Unable to Assign Latitude/Longitude Coordinates to Localities

You won't be able to assign latitude/longitude coordinates to localities is if the components of your localities have the same name. For example, consider the following partial configuration:

|  Node | Region | Datacenter |
|  ------ | ------ | ------ |
|  Node1 | us-east | datacenter-1 |
|  Node2 | us-west | datacenter-1 |

In this case, if you try to set the latitude/longitude coordinates to the datacenter level of the localities, you will get the "primary key exists" error and the **Node Map** won't be displayed. You can, however, set the latitude/longitude coordinates to the region components of the localities, and the **Node Map** will be displayed.

### Node Map Not Displayed for All Locality Levels

The **Node Map** is displayed only for the locality levels that have latitude/longitude coordinates assigned to them: 

- If you assign the latitude/longitude coordinates at the region level, the **Node Map** shows the regions on the world map. However, when you drill down to the datacenter and further to the individual nodes level, the world map disappears and the datacenters/nodes are be plotted in a circular layout.  
- If you assign the latitude/longitude coordinates at the datacenter level, the **Node Map** shows the regions with single datacenters at the same location assigned to the datacenter, while regions with multiple datacenters are shown at the center of the datacenter coordinates in the region. When you drill down to the datacenter levels, the **Node Map** shows the datacenter at their assigned coordinates. Further drilling down to individual node levels shows the nodes in a circular layout. 

[Assign latitude/longitude coordinates](#step-4-set-the-latitudes-and-longitudes-for-the-localities) at the locality level that you want to view on the **Node Map**.

### **Capacity Used** Value Displayed is More Than Configured Capacity

If you are running multiple nodes on a single machine (not recommended), the **Capacity Used** value may be incorrect. This is because when multiple nodes are running on a single machine, the machine's hard disk is treated as separate stores for each node, while in reality, only one hard disk is used for all nodes. The **Capacity Used** value is then displayed as the hard disk capacity used multiplied by the number of nodes on the machine.

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