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
1. On the **Capacity** page, provision cluster capacity. 

    Provisioned capacity refers to the processing resources (Request Units per sec) reserved for your workload. Each 500 RUs/sec equals approximately 1 vCPU. We recommend setting capacity at least 40% above expected peak workload to avoid performance issues. Refer to [Planning your cluster](plan-your-cluster.html) for the configuration requirements and recommendations for CockroachDB {{ site.data.products.standard }} clusters.

    You will be charged only for the storage you use. Storage starts at $0.75/GiB hour and the cost varies by region.

    Click **Next: Finalize**.

1. On the **Finalize** page, name your cluster. If applicable, the 30-day trial code is pre-applied to your cluster.
      
    Click **Create cluster**.

    Your cluster will be created in a few seconds and the **Create SQL user** dialog will display.