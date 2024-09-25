1. [Create a CockroachDB {{ site.data.products.cloud }} account](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) and learn more about your [free trial credits]({% link cockroachcloud/free-trial %}). 
1. On the **Get Started** page, click **Create cluster**.
1. On the **Select a plan** page, select **Standard**.
1. On the **Cloud & Regions** page, select a cloud provider (GCP or AWS) in the **Cloud provider** section.
1. In the **Regions** section, select a region for the cluster. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.standard }} clusters can be deployed. To create a multi-region cluster, click **Add region** and select additional regions.
1. Click **Next: Capacity**.
1. On the **Capacity** page, keep the [**Provisioned capacity**]({% link cockroachcloud/plan-your-cluster %}) at the default value of 2 vCPUs.

    Click **Next: Finalize**.

1. On the **Finalize** page, name your cluster. If applicable, free trial details are listed on the right pane.

    Click **Create cluster**.

    Your cluster will be created in a few seconds and the **Create SQL user** dialog will display.
