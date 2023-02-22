---
title: Egress Perimeter Controls for CockroachDB dedicated (Preview)
summary: Learn how to configure Egress Perimeter Controls for enhanced network security on a {{ site.data.products.dedicated }} cluster.
toc: true
toc_not_nested: true
docs_area: security
---

{% include feature-phases/preview-opt-in.md %}

This page describes how Egress Perimeter Controls can enhance the security of {{ site.data.products.dedicated }} clusters, and gives an overview of how to manage a cluster's egress rules.

## Why use Egress Perimeter Controls

{{ site.data.products.dedicated }} clusters must access external resources for many purposes:

- Managing [backups](../{{site.current_cloud_version}}/backup-and-restore-overview.html) as part of a disaster recovery plan
- Using [Change data capture (CDC) changefeeds](../{{site.current_cloud_version}}/change-data-capture-overview.html)
- [Exporting data](../{{site.current_cloud_version}}/export.html)
- [Exporting logs](export-logs.html)

By default, clusters can access external resources via the internet without restriction, and even [private clusters](private-clusters.html) can access their private network. This potentially leaves a cluster open to a *data exfiltration* scenario, wherein an attacker, often a [malicious insider](https://www.cisa.gov/defining-insider-threats), steals data by sending backups, changefeeds, data, or logs to a source that they control.

Operators of {{ site.data.products.dedicated }} clusters can mitigate against this risk by using Egress Perimeter Controls, which enable cluster administrators to restrict egress to a list of specified external destinations. This adds a strong layer of protection against malicious or accidental data exfiltration. Along with other measures such as [Private Clusters](private-clusters.html), Egress Perimeter Controls are an important component in an overall strategy for maximizing network security.

Further reading: [review how CockroachDB products differs in advanced security features](../{{site.current_cloud_version}}/security-reference/security-overview.html).

{{site.data.alerts.callout_info}}
Regardless of user-specific Egress Perimeter Control policy, egress is always permitted to services that are managed by Cockroach Labs and are essential to your cluster's functionality and ongoing operations.
{{site.data.alerts.end}}

## Before you begin

- You need a {{ site.data.products.dedicated }} cluster. Egress Perimeter Controls are not supported for {{ site.data.products.serverless }} clusters.
- Your cluster must be a **Private Cluster**, with no public IP addresses on its nodes. Refer to [Private Clusters](private-clusters.html).
- You need a service account with `admin` privilege on clusters in your organization. You can provision service accounts and API keys in CockroachDB Cloud Console. Refer to [Service Accounts](console-access-management.html#service-accounts).

{{site.data.alerts.callout_danger}}
The operations described in this page require an API key with very broad permissions, such as the ability to modify dedicated clusters, including adding potentially malicious egress rules that could defeat the type of attack that this feature is meant to prevent. Do not allow this key to be copied or transmitted in any form, including by capturing an image of your computer screen.
{{site.data.alerts.end}}

## Initialize your shell with your API key and Cluster id

1. Inspect your cluster in the [clusters page](https://cockroachlabs.cloud/clusters) in the {{ site.data.products.db }} console.

1. Find your cluster's universally unique identifier (UUID). To do this, select your cluster from the [clusters page](https://cockroachlabs.cloud/clusters) in the console. The UUID will appear in the URL of the overview page for that specific cluster, in the format:

    `https://cockroachlabs.cloud/cluster/{ your cluster's UUID }/overview`

1. Save your API key and cluster UUID as environment variables.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    CC_API_KEY={ your API key }
    CLUSTER_ID={ your cluster UUID }
    ~~~

1. Inspect your cluster with the Cloud API:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
    --header "Authorization: Bearer $CC_API_KEY" \
    --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID"
    ~~~

    ~~~json

    {
      "id": "21f474d5-3e65-4a54-9317-e8d8803ef917",
      "name": "docstest",
      "cockroach_version": "latest-v22.2-build(sha256:e42c4de8577556132120a9ab07efc1a2a96779c028ebab99223d862d9792428b)",
      "plan": "DEDICATED",
      "cloud_provider": "AWS",
      "account_id": "1234567890",
      "state": "CREATED",
      "creator_id": "b7d7bedc-b8f3-4a98-bd2c-4ba2bf9adbe1",
      "operation_status": "CLUSTER_STATUS_UNSPECIFIED",
      "config": {
        "dedicated": {
          "machine_type": "m5.large",
          "num_virtual_cpus": 2,
          "storage_gib": 15,
          "memory_gib": 8,
          "disk_iops": 225
        }
      },
      "regions": [
        {
          "name": "us-west-2",
          "sql_dns": "docstest-6qsh.aws-us-west-2.crdb.io",
          "ui_dns": "admin-docstest-6qsh.aws-us-west-2.crdb.io",
          "internal_dns": "",
          "node_count": 1
        }
      ],
      "created_at": "2022-10-27T18:03:47.862079Z",
      "updated_at": "2022-10-27T18:24:58.111198Z",
      "deleted_at": null
    }
    ~~~

## Use a deny-by-default egress traffic policy

{{site.data.alerts.callout_info}}
Essential external traffic destined to resources managed by Cockroach Labs will always be allowed regardless of user-specified egress policy.
{{site.data.alerts.end}}

1. Make a `POST` request ordering the API to update your cluster's egress policy from default allow-all to deny-all. This is needed before you can add egress rules to allowed external destinations.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request POST \
    --header "Authorization: Bearer $CC_API_KEY" \
    --header 'Cc-Version: 2022-09-20' \
    --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-rules/egress-traffic-policy" \
    --data '{"allow_all":false}'
    ~~~

    ~~~txt
    {}
    ~~~

## Create an egress rule to allow a destination

An egress rule is created with the following attributes:

- `name`: A name for the rule.
- `type`: Whether the destination will be specified as a fully-qualified domain name (FQDN), or as a range of IP addresses specified in CIDR notation. Value is `"FQDN"` or `"CIDR"`.
- `destination`: Either a fully qualified domain name, for example `www.cockroachlabs.com`, or a CIDR range, for example, `123.45.67.890/32`.
- `ports`: An array of allowed ports, for example `[44,8080]`.
    {{site.data.alerts.callout_danger}}
    By default, all ports are allowed.
    {{site.data.alerts.end}}
- `paths`: An array of allowed destination paths, for example `[ "/docsrule/secretdocsdata/*", "/specialdata/superimportant/*" ]`.
- `description`: The intended purpose of egress to the destination.

The following steps create one FQDN rule and one CIDR rule.

1. First, create a YAML manifest for a FQDN-based rule. This example adds egress to a couple of Google Cloud Platform (GCP) storage buckets.

    {% include_cached copy-clipboard.html %}
    ~~~yaml
    ---
    name: "roach-buckets"
    type: "FQDN"
    destination: "storage.googleapis.com"
    ports: [443, 80]
    paths:
        - "/customer-manged-bucket-1/*" # replace with bucket path
        - "/customer-manged-bucket-2/*" # replace with bucket path
    description: 'egress for GCP storage buckets'
    ~~~

1. Next, create a YAML manifest for a CIDR-based rule. This example adds egress to a self-managed Kafka cluster.

    {% include_cached copy-clipboard.html %}
    ~~~yaml
    --- # egress-rule2.yml
    name: "roach-kafka"
    type: "CIDR"
    destination: "123.34.62.123/32" # replace with Kafka cluster CIDR range
    ports: [443]
    paths: []
    description: 'egress for Kafka'
    ~~~

1. Use Ruby (or another technique), to compile human-editable YAML into API-parsable JSON:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    ruby -ryaml -rjson -e 'puts(YAML.load(ARGF.read).to_json)' < egress-rule1.yml > egress-rule1.json
    ruby -ryaml -rjson -e 'puts(YAML.load(ARGF.read).to_json)' < egress-rule2.yml > egress-rule2.json
    ~~~

1. Use the shell utility `jq` to inspect the JSON payload:

    {{site.data.alerts.callout_info}}
    On macOS, you can install `jq` from Homebrew: `brew install jq`
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cat egress-rule1.json |jq
    cat egress-rule2.json |jq
    ~~~

    ~~~json
    {
      "name": "roach-buckets",
      "type": "FQDN",
      "destination": "storage.googleapis.com",
      "ports": [
        443,
        80
      ],
      "paths": [
        "/customer-manged-bucket-1/*",
        "/customer-manged-bucket-2/*"
      ],
      "description": "egress for GCP storage buckets"
    }
    {
      "name": "roach-kafka",
      "type": "CIDR",
      "destination": "123.34.62.123/32",
      "ports": [
        443
      ],
      "paths": [],
      "description": "egress for Kafka"
    }
    ~~~

1. Make a `POST` request to create each rule from the JSON payload.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request POST \
    --header "Authorization: Bearer $CC_API_KEY" \
    --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-rules" \
    --data "@egress-rule1.json"

    curl --request POST \
    --header "Authorization: Bearer $CC_API_KEY" \
    --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-rules" \
    --data "@egress-rule2.json"
    ~~~

    ~~~json
    {
      "Rule": {
        "id": "564a25da-b99c-4e08-9ec3-483c0f1bc620",
        "cluster_id": "21f474d5-3e65-4a54-9317-e8d8803ef917",
        "name": "roach-buckets",
        "type": "FQDN",
        "state": "PENDING_CREATION",
        "crl_managed": false,
        "destination": "storage.googleapis.com",
        "ports": [
          443,
          80
        ],
        "paths": [
          "/customer-manged-bucket-1/*",
          "/customer-manged-bucket-2/*"
        ],
        "description": "egress for GCP storage buckets",
        "created_at": "2022-10-27T19:35:51.435571Z"
      }
    }
    {
      "Rule": {
        "id": "aa4f37d7-9aa4-456d-8df7-225d5c91c120",
        "cluster_id": "21f474d5-3e65-4a54-9317-e8d8803ef917",
        "name": "roach-kafka",
        "type": "CIDR",
        "state": "PENDING_CREATION",
        "crl_managed": false,
        "destination": "123.34.62.123/32",
        "ports": [
          443
        ],
        "paths": [],
        "description": "egress for Kafka",
        "created_at": "2022-10-27T19:36:25.670162Z"
      }
    }
    ~~~

    {{site.data.alerts.callout_danger}}
    Your cluster's firewall behavior is enforced asynchronously after the API response. After submitting the request, [check your egress rules](#check-egress-rules-for-a-cluster) to confirm that the new rules have been created.
    {{site.data.alerts.end}}

## Check the status of a rule

{{site.data.alerts.callout_info}}
Refer to the list of [rule statuses](#rule-statuses).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
--header "Authorization: Bearer $CC_API_KEY" \
--header  'Cc-Version: 2022-09-20' \
--url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-rules/$RULE_ID"
~~~

~~~txt
{
  "rule": {
    "id": "aa4f37d7-9aa4-456d-8df7-225d5c91c120",
    "cluster_id": "21f474d5-3e65-4a54-9317-e8d8803ef917",
    "name": "roach-kafka",
    "type": "CIDR",
    "state": "ACTIVE",
    "crl_managed": false,
    "destination": "123.34.62.123/32",
    "ports": [
      443
    ],
    "paths": [],
    "description": "egress for Kafka",
    "created_at": "2022-10-27T19:36:25.670162Z"
  }
~~~

## Check egress rules for a cluster

{{site.data.alerts.callout_info}}
Consult the glossary of [rule statuses](#rule-statuses).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
--header "Authorization: Bearer $CC_API_KEY" \
--header  'Cc-Version: 2022-09-20' \
--url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-rules"

~~~

~~~txt
{
  "rules": [
    {
      "id": "564a25da-b99c-4e08-9ec3-483c0f1bc620",
      "cluster_id": "21f474d5-3e65-4a54-9317-e8d8803ef917",
      "name": "roach-buckets",
      "type": "FQDN",
      "state": "ACTIVE",
      "crl_managed": false,
      "destination": "storage.googleapis.com",
      "ports": [
        443,
        80
      ],
      "paths": [
        "/customer-manged-bucket-1/*",
        "/customer-manged-bucket-2/*"
      ],
      "description": "egress for GCP storage buckets",
      "created_at": "2022-10-27T19:35:51.435571Z"
    },
    {
      "id": "aa4f37d7-9aa4-456d-8df7-225d5c91c120",
      "cluster_id": "21f474d5-3e65-4a54-9317-e8d8803ef917",
      "name": "roach-kafka",
      "type": "CIDR",
      "state": "ACTIVE",
      "crl_managed": false,
      "destination": "123.34.62.123/32",
      "ports": [
        443
      ],
      "paths": [],
      "description": "egress for Kafka",
      "created_at": "2022-10-27T19:36:25.670162Z"
    }
  ],
  "pagination": null
}
~~~

## Remove a rule

To delete a rule, make `DELETE` request to the rule's path.

{{site.data.alerts.callout_danger}}
Your cluster's firewall behavior is enforced asynchronously after the API response. After submitting the request, [check your egress rules](#check-egress-rules-for-a-cluster) to confirm that the deletion is complete.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~shell
curl --request DELETE \
--header "Authorization: Bearer $CC_API_KEY" \
--header  'Cc-Version: 2022-09-20' \
--url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-rules/$RULE_ID"
~~~

~~~txt
{
  "Rule": {
    "id": "aa4f37d7-9aa4-456d-8df7-225d5c91c120",
    "cluster_id": "21f474d5-3e65-4a54-9317-e8d8803ef917",
    "name": "roach-kafka",
    "type": "CIDR",
    "state": "PENDING_DELETION",
    "crl_managed": false,
    "destination": "123.34.62.123/32",
    "ports": [
      443
    ],
    "paths": [],
    "description": "egress for Kafka",
    "created_at": "2022-10-27T19:36:25.670162Z"
  }
}
~~~

## Rule statuses

The API displays the following statuses for a rule, when you [inspect an egress rule] or [list a cluster's egress rules]:

- `ACTIVE`: The rule has been successfully enforced in your cluster's network firewall and egress is currently allowed to the specified destination.
- `PENDING_CREATION`: Implementation of a new rule is in process. The behavior of the cluster's network firewall may not yet reflect the new rule, so egress may not yet be allowed to the selected destination.
- `CREATION_FAILED`: Something went wrong in the process of implementing a rule. This is a rare occurrence and does indicate that you should [contact the Cockroach Labs Support Team](https://support.cockroachlabs.com) immediately, rather than attempting to retry rule creation, to avoid leaving your cluster's firewall in an unknown state.
- `PENDING_UPDATE`: An `PATCH` request to update a rule is in process. The behavior may not yet be enforced in your cluster's firewall.
- `PENDING_DELETION`: The rule-removal is being enforced. The behavior of the cluster's network firewall may still reflect the target rule, so egress may still be allowed to the destination.
- `DELETION_FAILED`: A rule update or a rule removal has failed. The behavior of the cluster's network firewall may still reflect the previous state of the rule. This is a rare occurrence and does indicate that you should [contact the Cockroach Labs Support Team](https://support.cockroachlabs.com) immediately, rather than attempting to retry rule creation, to avoid leaving your cluster's firewall in an unknown state.
- `INCONSISTENT`: This indicates that a rule cannot apply consistently across all of the regions or compute resources to which it is meant to apply. This is a rare occurrence and does indicate that you should [contact the Cockroach Labs Support Team](https://support.cockroachlabs.com) immediately, rather than attempting to retry rule creation, to avoid leaving your cluster's firewall in an unknown state.

{{site.data.alerts.callout_danger}}
Generally, any kind of `FAILED` state, or an `INCONSISTENT` state, is a rare occurrence but can potentially leave the cluster in an unknown state. You should [contact the Cockroach Labs Support Team](https://support.cockroachlabs.com) immediately, rather than attempting to retry rule creation, to avoid leaving your cluster's firewall in an unknown state.
{{site.data.alerts.end}}
