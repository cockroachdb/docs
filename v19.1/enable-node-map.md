---
title: Enable the Node Map
summary: Learn how to enable the node map in the Admin UI.
toc: true
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the Admin UI can only be accessed by an `admin` user. See [Admin UI access](admin-ui-overview.html#admin-ui-access).
{{site.data.alerts.end}}

The **Node Map** visualizes the geographical configuration of a multi-regional cluster by plotting the node localities on a world map. The **Node Map** also provides real-time cluster metrics, with the ability to drill down to individual nodes to monitor and troubleshoot the cluster health and performance.

This page walks you through the process of setting up and enabling the **Node Map**.

{{site.data.alerts.callout_info}}The <b>Node Map</b> is an <a href="enterprise-licensing.html">enterprise-only</a> feature. However, you can <a href="https://www.cockroachlabs.com/get-cockroachdb/enterprise">request a trial license</a>  to try it out. {{site.data.alerts.end}}

<img src="{{ 'images/v19.1/admin-ui-node-map.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Set up and enable the Node Map

To enable the **Node Map**, you need to start the cluster with the correct `--locality` flags and assign the latitudes and longitudes for each locality.

{{site.data.alerts.callout_info}}The <b>Node Map</b> will not be displayed until <i>all</i> nodes are started with the correct <code>--locality</code> flags and all localities are assigned the corresponding latitudes and longitudes. {{site.data.alerts.end}}

Consider a scenario of a four-node geo-distributed cluster with the following configuration:

|  Node | Region | Datacenter |
|  ------ | ------ | ------ |
|  Node1 | us-east-1 | us-east-1a |
|  Node2 | us-east-1 | us-east-1b |
|  Node3 | us-west-1 | us-west-1a |
|  Node4 | eu-west-1 | eu-west-1a |

### Step 1. Start the nodes with the correct `--locality` flags

To start a new cluster with the correct `--locality` flags:

Start Node 1:

{% include_cached copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=us-east-1,datacenter=us-east-1a  \
--advertise-addr=<node1 address> \
--cache=.25 \
--max-sql-memory=.25 \
--join=<node1 address>,<node2 address>,<node3 address>,<node4 address>
~~~

Start Node 2:

{% include_cached copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=us-east-1,datacenter=us-east-1b \
--advertise-addr=<node2 address> \
--cache=.25 \
--max-sql-memory=.25 \
--join=<node1 address>,<node2 address>,<node3 address>,<node4 address>
~~~

Start Node 3:

{% include_cached copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=us-west-1,datacenter=us-west-1a \
--advertise-addr=<node3 address> \
--cache=.25 \
--max-sql-memory=.25 \
--join=<node1 address>,<node2 address>,<node3 address>,<node4 address>
~~~

Start Node 4:

{% include_cached copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=eu-west-1,datacenter=eu-west-1a \
--advertise-addr=<node4 address> \
--cache=.25 \
--max-sql-memory=.25 \
--join=<node1 address>,<node2 address>,<node3 address>,<node4 address>
~~~

Use the [`cockroach init`](initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=<address of any node>
~~~

[Access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui). The following page is displayed:

<img src="{{ 'images/v19.1/admin-ui-node-map-before-license.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Step 2. [Set the enterprise license](enterprise-licensing.html) and refresh the Admin UI

The following page should be displayed:

<img src="{{ 'images/v19.1/admin-ui-node-map-after-license.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Step 3. Set the latitudes and longitudes for the localities

Launch the built-in SQL client:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=<address of any node>
~~~

Insert the approximate latitudes and longitudes of each region into the `system.locations` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO system.locations VALUES
  ('region', 'us-east-1', 37.478397, -76.453077),
  ('region', 'us-west-1', 38.837522, -120.895824),
  ('region', 'eu-west-1', 53.142367, -7.692054);
~~~

{{site.data.alerts.callout_info}}The <b>Node Map</b> will not be displayed until all regions are assigned the corresponding latitudes and longitudes. {{site.data.alerts.end}}

For the latitudes and longitudes of AWS, Azure, and Google Cloud regions, see [Location Coordinates for Reference](#location-coordinates-for-reference).

### Step 4. View the Node Map

[Open the **Overview page**](admin-ui-access-and-navigate.html) and select **Node Map** from the **View** drop-down menu. The **Node Map** will be displayed:

<img src="{{ 'images/v19.1/admin-ui-node-map-complete.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Step 5. Navigate the Node Map

Let's say you want to navigate to Node 2, which is in datacenter `us-east-1a` in the `us-east-1` region:

1. Click on the map component marked as **region=us-east-1** on the **Node Map**. The datacenter view is displayed.
2. Click on the datacenter component marked as **datacenter=us-east-1a**. The individual node components are displayed.
3. To navigate back to the cluster view, either click on **Cluster** in the bread-crumb trail at the top of the **Node Map**, or click **Up to region=us-east-1** and then click **Up to Cluster** in the lower left-hand side of the **Node Map**.

<img src="{{ 'images/v19.1/admin-ui-node-map-navigation.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Troubleshoot the Node Map

### Node Map not displayed

The **Node Map** will not be displayed until all nodes have localities and are assigned the corresponding latitudes and longitudes. To verify if you have assigned localities as well as latitude and longitudes assigned to all nodes, navigate to the Localities debug page (`https://<address of any node>:8080/#/reports/localities`) in the Admin UI.

The Localities debug page displays the following:

- Localities configuration that you set up while starting the nodes with the `--locality` flags.
- Nodes corresponding to each locality.
- Latitude and longitude coordinates for each locality/node.

On the page, ensure that every node has a locality as well as latitude/longitude coordinates assigned to them.

### Node Map not displayed for all locality levels

The **Node Map** is displayed only for the locality levels that have latitude/longitude coordinates assigned to them:

- If you assign the latitude/longitude coordinates at the region level, the **Node Map** shows the regions on the world map. However, when you drill down to the datacenter and further to the individual nodes, the world map disappears and the datacenters/nodes are plotted in a circular layout.  
- If you assign the latitude/longitude coordinates at the datacenter level, the **Node Map** shows the regions with single datacenters at the same location assigned to the datacenter, while regions with multiple datacenters are shown at the center of the datacenter coordinates in the region. When you drill down to the datacenter levels, the **Node Map** shows the datacenter at their assigned coordinates. Further drilling down to individual nodes shows the nodes in a circular layout.

[Assign latitude/longitude coordinates](#step-3-set-the-latitudes-and-longitudes-for-the-localities) at the locality level that you want to view on the **Node Map**.

## Known limitations

### Unable to assign latitude/longitude coordinates to localities

{% include {{ page.version.version }}/known-limitations/node-map.md %}

### **Capacity Used** value displayed is more than configured Capacity

{% include {{ page.version.version }}/misc/available-capacity-metric.md %}

## Location coordinates for reference

### AWS locations

{% include {{ page.version.version }}/misc/aws-locations.md %}

### Azure locations

{% include {{ page.version.version }}/misc/azure-locations.md %}

### Google Cloud locations

{% include {{ page.version.version }}/misc/gce-locations.md %}
