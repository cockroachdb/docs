---
title: Configure Egress Private Endpoints
summary: Learn how to configure egress private endpoints for enhanced network security on a CockroachDB Cloud cluster.
toc: true
docs_area: security
cloud: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/limited-access.md %}
{{site.data.alerts.end}}

Establish a secure network connection from a CockroachDB {{ site.data.products.advanced }} cluster to send [changefeeds]({% link {{ site.versions["stable"] }}/change-data-capture-overview.md %}) to your private cloud infrastructure with *egress private endpoints*. You can use the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) to create and manage egress private endpoints on a CockroachDB {{ site.data.products.advanced }} cluster.

CockroachDB {{ site.data.products.cloud }} supports egress private endpoints with the following cloud services:

- [Amazon Virtual Private Cloud (AWS VPC)](https://aws.amazon.com/vpc/)
- [Amazon Managed Streaming for Apache Kafka (MSK)](https://aws.amazon.com/msk/) (MSK Provisioned only. MSK Serverless is not supported.)
- [Google Cloud VPC Private Service Connect (GCP PSC)](https://cloud.google.com/vpc/docs/private-service-connect)
- [Confluent Cloud on GCP or AWS](https://www.confluent.io/confluent-cloud/)

{{site.data.alerts.callout_info}}
Billing for egress private endpoint usage is based on bytes processed over the endpoint, which includes the cloud provider's per-GB data processing fees and any applicable data transfer charges. There is no additional markup from Cockroach Labs. These charges appear as separate line items on your invoice under **Private endpoint - bytes processed**.
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
Regions cannot be removed from a CockroachDB {{ site.data.products.cloud }} cluster if there are egress private endpoints in that region. When a {{ site.data.products.cloud }} cluster is deleted, all private endpoints associated with the cluster are deleted as well.
{{site.data.alerts.end}}

## Prerequisites

Refer to the following sections for prerequisites that apply to the corresponding cloud service:

### AWS VPC

The CockroachDB {{ site.data.products.cloud }} AWS account must be added as a principal on the endpoint service. Using your CockroachDB {{ site.data.products.cloud }} `account_id`, [add the `arn:aws:iam::<CC_ACCOUNT_ID>:root` principal](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) to the endpoint service definition.

You can use the following API call to retrieve your CockroachDB {{ site.data.products.cloud }} `account_id`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl --request GET \
  --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
  --header "Authorization: Bearer {secret_key}" | jq .account_id
~~~

### AWS MSK

The following prerequisites apply to the MSK service:

- The cluster must not use `kafka.t3.small` instances.
- If the cluster is not using IAM authentication, set the `allow.everyone.if.no.acl.found=false` [ACL](https://docs.aws.amazon.com/msk/latest/developerguide/msk-acls.html).
- Multi-VPC Connectivity must be enabled.
- Using the `account_id` returned from the `GET /api/v1/clusters/{cluster_id}`, include the following in the [cluster policy](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html):

    {% include_cached copy-clipboard.html %}
    ~~~ json
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<CC_ACCOUNT_ID>:root"
      },
      "Action": [
        "kafka:CreateVpcConnection",
        "kafka:GetBootstrapBrokers",
        "kafka:DescribeCluster",
        "kafka:DescribeClusterV2"
      ],
      "Resource": "<CUSTOMER_MSK_CLUSTER_ARN>"
    }
    ~~~

### GCP PSC

The following prerequisites apply to the Google Cloud VPC service:

- The CockroachDB {{ site.data.products.cloud }} account's GCP project must be granted explicit approval as a consumer. Follow the [Google Cloud PSC documentation](https://cloud.google.com/vpc/docs/configure-private-service-connect-producer#publish-service-explicit), and follow the steps to **Accept connections for selected projects** with your CockroachDB {{ site.data.products.cloud }} GCP account ID.

    You can use the following API call to retrieve your CockroachDB {{ site.data.products.cloud }} `account_id`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --request GET \
      --url https://cockroachlabs.cloud/api/v1/clusters/{cluster_id} \
      --header "Authorization: Bearer {secret_key}" | jq .account_id
    ~~~

- Enable [consumer global access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#compatibility) on the service load balancer or forwarding rule.

### Confluent Cloud

You can configure egress private endpoints to connect to an AWS or GCP private service configured in a Confluent account. Endpoint creation follows the same process and syntax as for AWS or GCP.

Confluent Cloud requires a custom DNS configuration due to the TLS certificates provisioned for their Kafka clusters. Collect the required domain names from Confluent. After the endpoint is created, [configure custom DNS records](#configure-custom-dns) for the cluster.

## Create an egress private endpoint

A user with the [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin), [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator), or [Cluster Creator]({% link cockroachcloud/authorization.md %}#cluster-creator) roles can create an egress private endpoint by sending a `POST` request to the `/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints` endpoint with the following payload information:

- `cluster_id`: The CockroachDB {{ site.data.products.cloud }} cluster ID.
- `region`: The region code where the target service identifier is located (e.g. `us-east-1`).
- `target_service_identifier`: The unique identifier of the target service, which is a different value depending on the service:
    - **AWS VPC**: The AWS private service name.
    - **MSK**: The MSK-provisioned cluster's Amazon Resource Name (ARN).
    - **GCP PSC**: The GCP service attachment.
- `target_service_type`: Description of the service type, dependent on the service and authentication method:
    - **AWS VPC** or **GCP PSC**: Set to `PRIVATE_SERVICE`.
    - **MSK** with SASL/SCRAM authentication: Set to `MSK_SASL_SCRAM`.
    - **MSK** with IAM access control: Set to `MSK_SASL_IAM`.
    - **MSK** with mutual TLS authentication: Set to `MSK_TLS`.

Once this request is sent, the CockroachDB {{ site.data.products.cloud }} cluster enters a maintenance mode where other configuration changes (cluster scaling, feature configuration, upgrades, etc) cannot be made until the operation is complete. The operation is complete when the [endpoint status](#check-the-endpoint-status) is `AVAILABLE` and both the `endpoint_id` and `endpoint_address` fields are populated.

### Example endpoint creation requests

The following example `POST` requests assume that an API key has been created for a user with the appropriate role, such as [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator):

#### AWS private service endpoint

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-X POST \
-H "Authorization: Bearer {secret_key}" \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "{cluster_id}",
  "region": "us-east-1",
  "target_service_identifier": "com.amazonaws.vpce.us-east-1.vpce-svc-example",
  "target_service_type": "PRIVATE_SERVICE"
}'
~~~

#### Amazon CloudWatch logs export endpoint

Log export to Amazon CloudWatch requires that you create a private service endpoint for each CockroachDB {{ site.data.products.cloud }} region, populating `target_service_identifier` with the domain name of a CloudWatch instance in that region. Since CloudWatch is an AWS-managed service, logs are scoped to the AWS account where the endpoint is created. The access keys on the export dictate which CloudWatch account receives the logs.

To export logs from multiple {{ site.data.products.cloud }} clusters across different regions to a single CloudWatch instance, [configure custom DNS](#configure-custom-dns) so that each `target_service_identifier` value resolves to the same target CloudWatch endpoint. In this situation, the `logexport` [endpoint]({% link cockroachcloud/export-logs-advanced.md %}#the-logexport-endpoint) automatically sets the `region` field to the region of the CloudWatch instance. 

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-X POST \
-H "Authorization: Bearer {secret_key}" \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "{cluster_id}",
  "region": "us-east-1",
  "target_service_identifier": "com.amazonaws.us-east-1.log",
  "target_service_type": "PRIVATE_SERVICE"
}'
~~~

For more information about log export to Amazon CloudWatch, read the [log export documentation]({% link cockroachcloud/export-logs.md %}).

#### MSK cluster endpoint

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-X POST \
-H "Authorization: Bearer {secret_key}" \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "{cluster_id}",
  "region": "us-east-2",
  "target_service_identifier": "arn:aws:kafka:us-east-2:example:cluster/msk-example/99bcd320-3af1-42cc-b8cc-example-7",
  "target_service_type": "MSK_SASL_SCRAM"
}'
~~~

#### GCP private service endpoint

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-X POST \
-H "Authorization: Bearer {secret_key}" \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "{cluster_id}",
  "region": "us-east1",
  "target_service_identifier": "projects/cc-example/regions/us-east1/serviceAttachments/s-example-service-attachment-us-east1-d",
  "target_service_type": "PRIVATE_SERVICE"
}'
~~~

#### Example response

~~~ json
{
    "id": "{endpoint_id}",
    "endpoint_connection_id": "",
    "region": "us-east-2",
    "target_service_identifier": "com.amazonaws.vpce.us-east-2.vpce-svc-example",
    "target_service_type": "PRIVATE_SERVICE",
    "endpoint_address": ""
}
~~~

{{site.data.alerts.callout_info}}
Depending on the cloud service, there may be an additional step necessary to manually accept the connection on the remote side.
{{site.data.alerts.end}}

### Configure custom DNS

If the cloud service has a TLS certificate that requires traffic to be sent from a specific domain, such as Confluent Cloud, you can use the {{ site.data.products.cloud }} API to create custom DNS records for a CockroachDB {{ site.data.products.cloud }} cluster that points to the `endpoint_address` of an egress private endpoint.

Before creating a custom DNS record, [check that the endpoint status is in the `AVAILABLE` state](#check-the-endpoint-status). Save the `egress_private_endpoints.id` value for later use. This ID is distinct from the `endpoint_connection_id`, which is an external identifier.

Send a `PATCH` request to the `/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints/{endpoint_id}/domain-names` endpoint with the following payload information:

- `cluster_id`: The CockroachDB {{ site.data.products.cloud }} cluster ID.
- `endpoint_id`: The `id` value of the egress private endpoint.
- `domain_names`: A list of domain names to resolve to the private endpoint, as required by the cloud service provider.

For example:

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints/{endpoint_id}/domain-names \
-X PATCH \
-H "Authorization: Bearer {secret_key}" \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "{cluster_id}",
  "endpoint_id": "{endpoint_id}",
  "domain_names": ["*.us-east-2.aws.confluent.cloud"]
}'
~~~

The cluster enters maintenance mode once more until the DNS setup is complete, which may take a minute or longer. Traffic from the CockroachDB {{ site.data.products.cloud }} cluster should now be routed appropriately to the private endpoint.

## Check the endpoint status

Send a `GET` request to the `/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints` endpoint to review the status of all egress private endpoints on the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-H "Authorization: Bearer {secret_key}"
~~~

The response lists all egress private endpoints on the cluster. The `state` field indicates the status of each endpoint:

~~~ json
{
    "egress_private_endpoints": [
        {
            "id": "{endpoint_id}",
            "endpoint_connection_id": "vpce-example",
            "region": "us-east-2",
            "target_service_identifier": "com.amazonaws.vpce.us-east-2.vpce-svc-example",
            "target_service_type": "PRIVATE_SERVICE",
            "endpoint_address": "vpce-example-onq0bw5q.vpce-svc-example.us-east-2.vpce.amazonaws.com",
            "state": "AVAILABLE",
            "domain_names": []
        }
    ],
    "pagination": null
}
~~~

The following list describes all of the possible `state` values and their meanings:

- `PENDING`: The endpoint is in the process of being created.
- `PENDING_ACCEPTANCE`: The endpoint needs to be manually accepted on the cloud provider service.
- `AVAILABLE`: The endpoint has been created and is available for traffic.
- `DELETING`: The endpoint is in the process of being deleted from the cluster.
- `REJECTED`: The endpoint connection was rejected on the cloud provider side.
- `FAILED`: Something went wrong with the creation of the endpoint in the cloud provider.
- `EXPIRED`: The connection request expired before it was accepted on the cloud provider service.
- `UNSPECIFIED`: Could not determine the current state of the endpoint.

## Delete a private endpoint

To delete a private endpoint, send a `DELETE` request to the `/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints/{endpoint_id}` endpoint specifying the following information:

- `cluster_id`: The CockroachDB {{ site.data.products.cloud }} cluster ID.
- `endpoint_id`: The `id` value of the egress private endpoint.

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://cockroachlabs.cloud/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints/{endpoint_id} \
-X DELETE \
-H "Authorization: Bearer {secret_key}"
~~~

The endpoint briefly enters the `DELETING` state then is removed from the list of endpoints on the cluster.
