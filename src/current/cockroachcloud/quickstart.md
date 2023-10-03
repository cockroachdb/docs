---
title: Quickstart with CockroachDB
summary: Get started with a free CockroachDB Cloud cluster.
toc: true
cloud: true
referral_id: docs_quickstart_free
docs_area: get_started
---

This page shows you how to use the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) to create a CockroachDB {{ site.data.products.serverless }} cluster, connect to it using a sample workload, and run your first query.

## Create a CockroachDB {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Create a SQL user

{% include cockroachcloud/quickstart/create-first-sql-user.md %}

## Connect to the cluster

You can connect to your cluster directly from the {{ site.data.products.cloud }} Console's SQL Shell or using the command line. To connect a sample application to your cluster instead, refer to [Example Applications Overview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/example-apps.md)

    <div class="filters clearfix">
      <button class="filter-button" data-scope="console">Cloud Console</button>
      <button class="filter-button" data-scope="cli">Command line</button>
    </div>
    
<section class="filter-content" markdown="1" data-scope="console">

</section>
<section class="filter-content" markdown="1" data-scope="cli">

Once you create a SQL user, the **Connect to cluster** dialog will show information about how to connect to your cluster.

1. Select **General connection string** from the **Select option** dropdown.
1. Open the **General connection string** section, then copy the connection string provided and save it in a secure location.

    This Quickstart uses default certificates, so you can skip the Download CA Cert instructions.

    {{site.data.alerts.callout_info}} 
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only* once. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, a Cluster Administrator can reset it. Refer to: [Managing SQL users on a cluster]({% link cockroachcloud/managing-access.md %}#manage-sql-users-on-a-cluster)
    {{site.data.alerts.end}}

</section>

## Learn more

Now that you have a free CockroachDB {{ site.data.products.serverless }} cluster running, try out the following:

- Build a simple CRUD application in [Go](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb), [Java](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-java-app-with-cockroachdb), [Node.js](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb), or [Python](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb).
- [Learn CockroachDB SQL]({% link cockroachcloud/learn-cockroachdb-sql.md %}).
- [Create and manage SQL users]({% link cockroachcloud/managing-access.md %}).
- Explore our [example apps](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/example-apps.md) for examples on how to build applications using your preferred driver or ORM and run it on CockroachDB.
- [Migrate your existing data](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/migration-overview).

This page highlights just one way you can get started with CockroachDB. For information on other options that are available when creating a CockroachDB cluster, see the following:

- To create a Self-Hosted cluster, see [Start a Local Cluster](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/start-a-local-cluster).
- To create a CockroachDB {{ site.data.products.dedicated }} cluster, see [Quickstart with CockroachDB {{ site.data.products.dedicated }}]({% link cockroachcloud/quickstart-trial-cluster.md %}).
- To create a CockroachDB {{ site.data.products.serverless }} cluster with other configurations (e.g., a different cloud provider, region, or monthly budget), see [Create a CockroachDB {{ site.data.products.serverless }} Cluster]({% link cockroachcloud/create-a-serverless-cluster.md %}).
- To connect to a CockroachDB {{ site.data.products.serverless }} cluster with other options (e.g., a different SQL user) and connection methods (with an application or [CockroachDB compatible tool](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/third-party-database-tools)), see [Connect to a CockroachDB {{ site.data.products.serverless }} Cluster]({% link cockroachcloud/connect-to-a-serverless-cluster.md %}).
