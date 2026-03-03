1. [Create a CockroachDB {{ site.data.products.cloud }} account]({% link cockroachcloud/create-an-account.md %}). If this is your first CockroachDB Cloud organization, it will be credited with $400 in [free trial credits]({% link cockroachcloud/free-trial.md %}) to get you started.
1. On the **Get Started** page, click **Create cluster**.
1. On the **Select a plan** page, select **Standard**.
1. On the **Cloud & Regions** page, select a cloud provider (GCP or AWS).
1. In the **Regions** section, select a region for the cluster. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.standard }} clusters can be deployed. To create a multi-region cluster, click **Add region** and select additional regions.
1. Click **Next: Capacity**.
1. On the **Capacity** page, keep the [**Provisioned capacity**]({% link cockroachcloud/plan-your-cluster.md %}) at the default value of 2 vCPUs.

    Click **Next: Finalize**.

1. On the **Finalize** page, name your cluster. If an active free trial is listed in the right pane, you will not need to add a payment method, though you will need to do this by the [end of the trial]({% link cockroachcloud/free-trial.md %}#add-payment-methods) to maintain your organization's clusters.

    Click **Create cluster**.

    Your cluster will be created in a few seconds and the **Create SQL user** dialog will display.
