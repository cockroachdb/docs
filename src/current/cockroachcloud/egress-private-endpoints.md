---
title: Configure Egress Private Endpoints
summary: Learn how to configure egress private endpoints for enhanced network security on a CockroachDB Cloud cluster.
toc: true
toc_not_nested: true
docs_area: security
cloud: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/limited-access.md %}
{{site.data.alerts.end}}

Establish secure network connectivity between CockroachDB {{ site.data.products.cloud }} and your private cloud infrastructure with **Egress private endpoints**. You can use the [CockroachDB {{ site.data.products.cloud }} API]({% link cockroachcloud/cloud-api.md %}) to create and manage egress private endpoints on a CockroachDB {{ site.data.products.cloud }} cluster.

CockroachDB {{ site.data.products.cloud }} supports egress private endpoints with the following cloud services:

- [Amazon Virtual Private Cloud (AWS VPC)](https://aws.amazon.com/vpc/)
- [Amazon Managed Streaming for Apache Kafka (MSK)](https://aws.amazon.com/msk/)
- [Google Cloud Virtual Private Cloud (GCP VPC)](https://cloud.google.com/vpc)

{{site.data.alerts.callout_danger}}
Regions cannot be removed from a CockroachDB {{ site.data.products.cloud }} cluster if there are private endpoints in the `AVAILABLE` state. When a {{ site.data.products.cloud }} cluster is deleted, all private endpoints associated with the cluster are deleted as well.
{{site.data.alerts.end}}

## Prerequisites

Refer to the following sections for prerequisites that apply to each cloud service:

### AWS VPC endpoints

The CockroachDB {{ site.data.products.cloud }} AWS account must be added as a principal on the endpoint service. Using the `account_id` returned from the `GET /api/v1/clusters/{cluster_id}`, add the `arn:aws:iam::<CC_ACCOUNT_ID>:root` principal to the endpoint service.

### MSK endpoints

The following prerequisites apply to the MSK service:

- The cluster must not use *kafka.t3.small* instances.
- If the cluster is not using IAM authentication, set the `allow.everyone.if.no.acl.found=false` ACL.
- Multi-VPC Connectivity must be enabled.
- Using the `account_id` returned from the `GET /api/v1/clusters/{cluster_id}`, include the following in the cluster policy:

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

## Create an egress private endpoint

A user with the [Cluster Admin role]({% link cockroachcloud/authorization.md %}#cluster-admin) can create an egress private endpoint by sending a `POST` request to the `/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints` endpoint with the following payload information:

- `cluster_id`: The CockroachDB {{ site.data.products.cloud }} cluster ID.
- `region`: The region code where the target service identifier is located (e.g. `us-east-1`).
- `target_service_identifier`: The unique identifier of the target service, which is a different value depending on the service:
    - **AWS VPC**: The AWS private service name.
    - **MSK**: The MSK-provisioned cluster's Amazon Resource Name (ARN).
    - **GCP VPC**: The GCP service attachment.
- `target_service_type`: Description of the service type, dependent on the service and authentication method:
    - **AWS VPC** or **GCP VPC**: Set to `PRIVATE_SERVICE`.
    - **MSK** with SASL/SCRAM authentication: Set to `MSK_SASL_SCRAM`.
    - **MSK** with IAM access control: Set to `MSK_SASL_IAM`.
    - **MSK** with mutual TLS authentication: Set to `MSK_TLS`.

Once this request is sent, the CockroachDB {{ site.data.products.cloud }} cluster enters a maintenance mode where other configuration changes (cluster scaling, feature configuration, upgrades, etc) cannot be made until the operation is complete.

The following example `POST` requests assume that an API key has been created for a user with the Cluster Admin role and stored in the `$API_SECRET` environment variable.

**Example AWS private service endpoint creation**

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://management-staging.crdb.io/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-X POST \
-H 'Authorization: Bearer $API_SECRET' \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "799c32e8-13ba-4d43-aef4-example",
  "region": "us-east-1",
  "target_service_identifier": "com.amazonaws.vpce.us-east-1.vpce-svc-example",
  "target_service_type": "PRIVATE_SERVICE"
}'
~~~

**Example MSK cluster endpoint creation**

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://management-staging.crdb.io/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-X POST \
-H 'Authorization: Bearer $API_SECRET' \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "799c32e8-13ba-4d43-aef4-example",
  "region": "us-east-2",
  "target_service_identifier": "arn:aws:kafka:us-east-2:033701886158:cluster/msk-example/99bcd320-3af1-42cc-b8cc-example-7",
  "target_service_type": "MSK_SASL_SCRAM"
}'
~~~

**Example MSK cluster endpoint creation**

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://management-staging.crdb.io/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-X POST \
-H 'Authorization: Bearer $API_SECRET' \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "799c32e8-13ba-4d43-aef4-example",
  "region": "us-east1",
  "target_service_identifier": "projects/cc-example/regions/us-east1/serviceAttachments/s-vr9zz-service-attachment-us-east1-d",
  "target_service_type": "PRIVATE_SERVICE"
}'
~~~

**Example response**

~~~ json
{
    "id": "2bf86fbe-cdf3-4703-8156-01228f0e19b3",
    "endpoint_connection_id": "",
    "region": "us-east-2",
    "target_service_identifier": "com.amazonaws.vpce.us-east-2.vpce-svc-0fb8e1b95f0ade981",
    "target_service_type": "PRIVATE_SERVICE",
    "endpoint_address": ""
}
~~~

Depending on the cloud service, there may be an additional step necessary to manually accept the connection on the remote side.

### Configure custom DNS for an egress private endpoint

If the cloud service has a TLS certificate that requires traffic to be sent from a specific domain, you can use the {{ site.data.products.cloud }} API to create custom DNS records for a CockroachDB {{ site.data.products.cloud }} cluster that points to the `endpoint_address` of an egress private endpoint.

Before creating a custom DNS record, [check the endpoint status](#check-the-endpoint-status) and make sure the endpoint is in the `AVAILABLE` state. Save the `egress_private_endpoints.id` value (not the `endpoint_connection_id` value, which is an external identifier for the endpoint) for use.

Send a `PATCH` request to the `/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints/{endpoint_id}/domain-names` endpoint with the following payload information:

- `cluster_id`: The CockroachDB {{ site.data.products.cloud }} cluster ID.
- `endpoint_id`: The `id` value of the egress private endpoint.
- `domain_names`: A list of domain names to resolve to the private endpoint, as required by the cloud service provider.

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://management-staging.crdb.io/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints/{endpoint_id}/domain-names \
-X PATCH \
-H 'Authorization: Bearer $API_SECRET' \
-H 'Content-Type: application/json' \
-d '{
  "cluster_id": "799c32e8-13ba-4d43-aef4-example",
  "endpoint_id": "7741fff1-5bb8-455c-bed8-example",
  "domain_names": ["*.us-east-2.aws.confluent.cloud"]
}'
~~~

The cluster enters maintenance mode once more until the DNS setup is complete. Traffic from the CockroachDB {{ site.data.products.cloud }} cluster should now be routed appropriately to the private endpoint.

## Check the endpoint status

Send a `GET` request to the `/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints` to review the status of all egress private endpoints on the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://management-staging.crdb.io/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints \
-H "Authorization: Bearer $API_SECRET"
~~~

The response lists out all egress private endpoints on the cluster. The `state` field describes the status of each endpoint:

~~~ json
{
    "egress_private_endpoints": [
        {
            "id": "2bf86fbe-cdf3-4703-8156-01228f0e19b3",
            "endpoint_connection_id": "vpce-0460d7c25b1f505dd",
            "region": "us-east-2",
            "target_service_identifier": "com.amazonaws.vpce.us-east-2.vpce-svc-0fb8e1b95f0ade981",
            "target_service_type": "PRIVATE_SERVICE",
            "endpoint_address": "vpce-0460d7c25b1f505dd-onq0bw5q.vpce-svc-0fb8e1b95f0ade981.us-east-2.vpce.amazonaws.com",
            "state": "AVAILABLE"
        }
    ],
    "pagination": null
}
~~~

The following list describes all of the possible `state` values and their meanings:


- `PENDING`: The endpoint is in the process of being created.
- `PENDING_ACCEPTANCE`: The endpoint needs to be manually accepted on the cloud provider service.
- `AVAILABLE`: The endpoint has been created and is available for traffic.
- `DELETING`: The endpoint is in the process of being deleted from the cloud provider.
- `DELETED`: The endpoint has been deleted in the cloud provider.
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
curl https://management-staging.crdb.io/api/v1/clusters/{cluster_id}/networking/egress-private-endpoints/{endpoint_id} \
-X DELETE \
-H "Authorization: Bearer $API_SECRET"
~~~
