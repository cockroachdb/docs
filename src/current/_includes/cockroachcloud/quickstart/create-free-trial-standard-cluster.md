{% comment %}
After the free trial details are finalized, add a link to free trial page to check for free trial eligibility.
{% endcomment %}

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.
1. On the **Clusters** page, click **Create cluster**.
1. On the **Select a plan** page, select **Standard**.
1. On the **Cloud & Regions** page, select a cloud provider (GCP or AWS) in the **Cloud provider** section. 
1. In the **Regions** section, select a region for the cluster. Refer to [CockroachDB {{ site.data.products.cloud }} Regions]({% link cockroachcloud/regions.md %}) for the regions where CockroachDB {{ site.data.products.standard }} clusters can be deployed. To create a multi-region cluster, click **Add region** and select additional regions.
1. Click **Next: Capacity**.
1. On the **Capacity** page, keep the **Provisioned capacity** at the default value of 1000 RUs/second.

    Click **Next: Finalize**.

1. On the **Finalize** page, name your cluster. If applicable, the 30-day trial code is pre-applied to your cluster.
      
    Click **Create cluster**.

    Your cluster will be created in a few seconds and the **Create SQL user** dialog will display.