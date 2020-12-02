---
title: Enable the Node Map
summary: Learn how to enable the node map in the DB Console.
toc: true
---

The **Node Map** is useful for:

- Visualizing the geographic configuration of a multi-region cluster on a world map.
- Viewing real-time cluster metrics.
- Drilling down to individual nodes for monitoring health and performance.

This page walks you through the process of setting up and enabling the Node Map.

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by an `admin` user. See [DB Console access](ui-overview.html#db-console-access).
{{site.data.alerts.end}}

{% include enterprise-feature.md %}

<img src="{{ 'images/v21.1/ui-node-map-navigation3.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

## Set up and enable the Node Map

To enable the Node Map, you need to start the cluster with the correct [`--locality`](cockroach-start.html#locality) flags and assign the latitude and longitude for each locality.

{{site.data.alerts.callout_info}}
The Node Map will not be displayed until *all* nodes are started with the correct `--locality` flags and all localities are assigned the corresponding latitude and longitude.
{{site.data.alerts.end}}

Consider a four-node geo-distributed cluster with the following configuration:

|  Node | Region | Datacenter |
|  ------ | ------ | ------ |
|  Node1 | us-east-1 | us-east-1a |
|  Node2 | us-east-1 | us-east-1b |
|  Node3 | us-west-1 | us-west-1a |
|  Node4 | eu-west-1 | eu-west-1a |

### Step 1. Start the nodes with the correct `--locality` flags

To start a new cluster with the correct `--locality` flags:

Start Node 1:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~
$ cockroach start \
--insecure \
--locality=region=eu-west-1,datacenter=eu-west-1a \
--advertise-addr=<node4 address> \
--cache=.25 \
--max-sql-memory=.25 \
--join=<node1 address>,<node2 address>,<node3 address>,<node4 address>
~~~

Use the [`cockroach init`](cockroach-init.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=<address of any node>
~~~

[Access the DB Console](ui-overview.html#db-console-access). The following page is displayed:

<img src="{{ 'images/v21.1/ui-node-map-before-license.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

### Step 2. Set the enterprise license and refresh the DB Console

After [setting the enterprise license](enterprise-licensing.html), the Node Map should now be displaying the highest-level localities you defined:

<img src="{{ 'images/v21.1/ui-node-map-after-license.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
To be displayed on the world map, localities must be assigned a corresponding latitude and longitude.
{{site.data.alerts.end}}

### Step 3. Set the latitudes and longitudes for the localities

Launch the built-in SQL client:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=<address of any node>
~~~

Insert the approximate latitude and longitude of each region into the `system.locations` table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO system.locations VALUES
  ('region', 'us-east-1', 37.478397, -76.453077),
  ('region', 'us-west-1', 38.837522, -120.895824),
  ('region', 'eu-west-1', 53.142367, -7.692054);
~~~

For the latitudes and longitudes of AWS, Azure, and Google Cloud regions, see [Location Coordinates for Reference](#location-coordinates).

### Step 4. Refresh the Node Map

Refresh the DB Console to see the updated Node Map:

<img src="{{ 'images/v21.1/ui-node-map-complete.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

### Step 5. Navigate the Node Map

Let's say you want to navigate to Node 2, which is in datacenter `us-east-1a` in the `us-east-1` region:

1. Click on the map component marked as **region=us-east-1** on the Node Map. The [locality component](ui-cluster-overview-page.html#locality-component) for the datacenter is displayed.

	<img src="{{ 'images/v21.1/ui-node-map-navigation1.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

1. Click on the datacenter component marked as **datacenter=us-east-1a**. The individual [node components](ui-cluster-overview-page.html#node-component) are displayed.

	<img src="{{ 'images/v21.1/ui-node-map-navigation2.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

1. To navigate back to the cluster view, either click on **Cluster** in the breadcrumb trail at the top of the Node Map, or click **Up to REGION=US-EAST-1** and then click **Up to CLUSTER** in the lower left-hand side of the Node Map.

## Troubleshoot the Node Map

### Node Map not displayed

The Node Map requires an [enterprise license](enterprise-licensing.html).

All nodes in the cluster must be assigned [localities](cockroach-start.html#locality). To be displayed on the world map, localities must be [assigned a corresponding latitude and longitude](#step-3-set-the-latitudes-and-longitudes-for-the-localities).

To verify both of the above, navigate to the Localities debug page (`https://<address of any node>:8080/#/reports/localities`) in the DB Console.

<img src="{{ 'images/v21.1/ui-localities-debug.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

The Localities debug page displays the following:

- Localities configuration that you set up while starting the nodes with the `--locality` flags.
- Nodes corresponding to each locality.
- Latitude and longitude coordinates for each locality/node.

### World Map not displayed for all locality levels

The world map is displayed only when [localities are assigned latitude/longitude coordinates](#step-3-set-the-latitudes-and-longitudes-for-the-localities).

If a locality (e.g., region) is not assigned latitude/longitude coordinates, it is displayed using the latitude/longitude of any lower-level localities it contains (e.g., datacenter). If no coordinates are available, localities are plotted in a circular layout.

### Displayed **Used Capacity** value is more than configured Capacity

{% include {{ page.version.version }}/misc/available-capacity-metric.md %}

## Location coordinates

### AWS locations

{% include {{ page.version.version }}/misc/aws-locations.md %}

### Azure locations

{% include {{ page.version.version }}/misc/azure-locations.md %}

### Google Cloud locations

{% include {{ page.version.version }}/misc/gce-locations.md %}
