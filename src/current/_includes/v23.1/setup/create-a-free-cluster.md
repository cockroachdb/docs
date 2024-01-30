{% include cockroachcloud/free-cluster-limit.md %}

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}" rel="noopener" target="_blank">sign up for a CockroachDB {{ site.data.products.cloud }} account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your CockroachDB {{ site.data.products.cloud }} account.
1. On the **Clusters** page, click **Create Cluster**.
1. On the **Create your cluster** page, select **Serverless**.
1. *(Optional)* Set a **Resource limit**.

    Each non-contract CockroachDB {{ site.data.products.cloud }} organization is given 50 million [Request Units](#request-units) and 10 GiB of storage for free each month. If this is your first cluster, you can select **Start for free**.
    
1. Click **Create cluster**.

    Your cluster will be created in a few seconds and the **Create SQL user** dialog will display.