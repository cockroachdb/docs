---
title: Enable the Node Map
summary: Learn how to enable the node map in the Admin UI.
toc: false
---

<span class="version-tag">New in v2.0</span> The **Node Map** visualizes the geographical configuration of a multi-regional cluster by plotting the node localities on a world map. The **Node Map** also provides real-time cluster metrics, with the ability to drill down to individual nodes to monitor and troubleshoot the cluster health and performance.

This page walks you through the process of setting up and enabling the **Node Map**.

{{site.data.alerts.callout_info}}The <b>Node Map</b> is an <a href="enterprise-licensing.html">enterprise-only</a> feature. However, you can <a href="https://www.cockroachlabs.com/pricing/request-a-license/">request a trial license</a>  to try it out. {{site.data.alerts.end}}

<img src="{{ 'images/v2.1/admin-ui-node-map.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

<div id="toc"></div>

## Set Up and Enable the Node Map

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

~~~
Build Tag:   {{page.release_info.version}}
Build Time:  {{page.release_info.build_time}}
Distribution: CCL
Platform:     darwin amd64 (x86_64-apple-darwin13)
Go Version:   go1.10
C Compiler:   4.2.1 Compatible Clang 3.8.0 (tags/RELEASE_380/final)
Build SHA-1:  367ad4f673b33694df06caaa2d7fc63afaaf3053
Build Type:   release
~~~

If any node is running an earlier version, [upgrade it to CockroachDB v2.0](upgrade-cockroach-version.html).

### Step 2. Start the Nodes with the Correct `--locality` Flags

To start a new cluster with the correct `--locality` flags:

Start Node 1:

{% include copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=us-east-1,datacenter=us-east-1a  \
--host=<node1 address> \
--cache=25% \
--max-sql-memory=25% \
--join=<node1 address>:26257,<node2 address>:26257,<node3 address>:26257,<node4 address>:26257
~~~

Start Node 2:

{% include copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=us-east-1,datacenter=us-east-1b \
--host=<node2 address> \
--cache=25% \
--max-sql-memory=25% \
--join=<node1 address>:26257,<node2 address>:26257,<node3 address>:26257,<node4 address>:26257
~~~

Start Node 3:

{% include copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=us-west-1,datacenter=us-west-1a \
--host=<node3 address> \
--cache=25% \
--max-sql-memory=25% \
--join=<node1 address>:26257,<node2 address>:26257,<node3 address>:26257,<node4 address>:26257
~~~

Start Node 4:

{% include copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=eu-west-1,datacenter=eu-west-1a \
--host=<node4 address> \
--cache=25% \
--max-sql-memory=25% \
--join=<node1 address>:26257,<node2 address>:26257,<node3 address>:26257,<node4 address>:26257
~~~

Use the [`cockroach init`](initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure
~~~

[Access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui). The following page is displayed:

<img src="{{ 'images/v2.1/admin-ui-node-map-before-license.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Step 3. [Set the Enterprise License](enterprise-licensing.html) and refresh the Admin UI

The following page should be displayed:

<img src="{{ 'images/v2.1/admin-ui-node-map-after-license.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Step 4. Set the Latitudes and Longitudes for the Localities

Launch the built-in SQL client:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=<address of any node>
~~~

Insert the approximate latitudes and longitudes of each region into the `system.locations` table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO system.locations VALUES
  ('region', 'us-east-1', 37.478397, -76.453077),
  ('region', 'us-west-1', 38.837522, -120.895824),
  ('region', 'eu-west-1', 53.142367, -7.692054);
~~~

{{site.data.alerts.callout_info}}The <b>Node Map</b> won't be displayed until all regions are assigned the corresponding latitudes and longitudes. {{site.data.alerts.end}}

For the latitudes and longitudes of AWS and Azure regions, see [Locations Coordinates for Reference](#location-coordinates-for-reference).

### Step 5. View the Node Map

[Open the **Overview page**](admin-ui-access-and-navigate.html) and select **Node Map** from the **View** drop-down menu. The **Node Map** will be displayed:

<img src="{{ 'images/v2.1/admin-ui-node-map-complete.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Step 6. Navigate the Node Map

Let's say you want to navigate to Node 2, which is in datacenter `us-east-1a` in the `us-east-1` region:

1. Click on the map component marked as **region=us-east-1** on the **Node Map**. The datacenter view is displayed.
2. Click on the datacenter component marked as **datacenter=us-east-1a**. The individual node components are displayed.
3. To navigate back to the cluster view, either click on **Cluster** in the bread-crumb trail at the top of the **Node Map**, or click **Up to region=us-east-1** and then click **Up to Cluster** in the lower left-hand side of the **Node Map**.

<img src="{{ 'images/v2.1/admin-ui-node-map-navigation.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Troubleshoot the Node Map

### Node Map Not Displayed

The **Node Map** won't be displayed until all nodes have localities and are assigned the corresponding latitudes and longitudes. To verify if you have assigned localities as well as latitude and longitudes assigned to all nodes, navigate to the Localities debug page (`https://<address of any node>:8080/#/reports/localities`) in the Admin UI.

The Localities debug page displays the following:

- Localities configuration that you set up while starting the nodes with the `--locality` flags.
- Nodes corresponding to each locality.
- Latitude and longitude coordinates for each locality/node.

On the page, ensure that every node has a locality as well as latitude/longitude coordinates assigned to them.

### Node Map Not Displayed for All Locality Levels

The **Node Map** is displayed only for the locality levels that have latitude/longitude coordinates assigned to them:

- If you assign the latitude/longitude coordinates at the region level, the **Node Map** shows the regions on the world map. However, when you drill down to the datacenter and further to the individual nodes, the world map disappears and the datacenters/nodes are plotted in a circular layout.  
- If you assign the latitude/longitude coordinates at the datacenter level, the **Node Map** shows the regions with single datacenters at the same location assigned to the datacenter, while regions with multiple datacenters are shown at the center of the datacenter coordinates in the region. When you drill down to the datacenter levels, the **Node Map** shows the datacenter at their assigned coordinates. Further drilling down to individual nodes shows the nodes in a circular layout.

[Assign latitude/longitude coordinates](#step-4-set-the-latitudes-and-longitudes-for-the-localities) at the locality level that you want to view on the **Node Map**.

## Known Limitations

### Unable to Assign Latitude/Longitude Coordinates to Localities

{% include known_limitations/node-map.md %}

### **Capacity Used** Value Displayed is More Than Configured Capacity

{% include available-capacity-metric.md %}

## Location Coordinates for Reference

### AWS locations

|  Location | SQL Statement |
|  ------ | ------ |
|  US East (N. Virginia) | `INSERT into system.locations VALUES ('region', 'us-east-1', 37.478397, -76.453077)`|
|  US East (Ohio) | `INSERT into system.locations VALUES ('region', 'us-east-2', 40.417287, -76.453077)` |
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

### Azure locations

{% include azure-locations.md %}

### Google Cloud locations

|  Location | SQL Statement |
|  ------ | ------ |
|  us-east1 (South Carolina) | `INSERT into system.locations VALUES ('region', 'us-east1', 33.836082, -81.163727)` |
|  us-east4 (N. Virginia) | `INSERT into system.locations VALUES ('region', 'us-east4', 37.478397, -76.453077)` |
|  us-central1 (Iowa) | `INSERT into system.locations VALUES ('region', 'us-central1', 42.032974, -93.581543)` |
|  us-west1 (Oregon) | `INSERT into system.locations VALUES ('region', 'us-west1', 43.804133, -120.554201)` |
|  northamerica-northeast1 (Montreal) | `INSERT into system.locations VALUES ('region', 'northamerica-northeast1', 56.130366, -106.346771)` |
|  europe-west1 (Belgium) | `INSERT into system.locations VALUES ('region', 'europe-west1', 50.44816, 3.81886)` |
|  europe-west3 (Frankfurt) | `INSERT into system.locations VALUES ('region', 'europe-west3', 50.110922, 8.682127)` |
|  europe-west4 (Netherlands) | `INSERT into system.locations VALUES ('region', 'europe-west4', 53.4386, 6.8355)` |
|  europe-west2 (London) | `INSERT into system.locations VALUES ('region', 'europe-west2', 51.507351, -0.127758)` |
|  asia-east1 (Taiwan) | `INSERT into system.locations VALUES ('region', 'asia-east1', 24.0717, 120.5624)` |
|  asia-northeast1 (Tokyo) | `INSERT into system.locations VALUES ('region', 'asia-northeast1', 35.689487, 139.691706)` |
|  asia-southeast1 (Singapore) | `INSERT into system.locations VALUES ('region', 'asia-southeast1', 1.352083, 103.819836)` |
|  australia-southeast1 (Sydney) | `INSERT into system.locations VALUES ('region', 'australia-southeast1', -33.86882, 151.209296)` |
|  asia-south1 (Mumbai) | `INSERT into system.locations VALUES ('region', 'asia-south1', 19.075984, 72.877656)` |
|  southamerica-east1 (São Paulo) | `INSERT into system.locations VALUES ('region', 'southamerica-east1', -23.55052, -46.633309)` |
