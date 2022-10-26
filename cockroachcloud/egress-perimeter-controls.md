---
title: Egress Perimeter Controls for CockroachDB dedicated (Preview)
summary: Learn how to configure Egress Perimeter Controls for enhanced network security on a dedicated cluster
toc: true
toc_not_nested: true
docs_area: security 
---

{% include feature-phases/preview-opt-in.md %}

This page describes the reasons to use Egress Perimeter Controls for enhanced security in {{ site.data.products.dedicated }} clusters, and gives an overview of the user-flows involved.

## Why use Egress Perimeter Controls

{{ site.data.products.dedicated }} clusters must access external resources for many purposes:

- Managing backups as part of a disaster recovery plan
- Using [Change data capture (CDC) changefeeds](../{{site.versions["stable"]}}/change-data-capture-overview.html)
- Exporting data
- Exporting logs

By default, clusters can access external resources via the internet without restriction. This potentially leaves a cluster open to a *data exfiltration* scenario, wherein an attacker, often a [malicious insider](https://www.cisa.gov/defining-insider-threats) steals data by sending backups, changefeeds, data, or logs to a source that they control. 

Operators of {{ site.data.products.dedicated }} clusters can remove this risk by using Egress Perimiter Controls. This feature enables [admins](../{{site.versions["stable"]}}/security-reference/authorization.html#admin-role) to restrict egress to a specified external destinations. This adds a strong layer of protection against malicious data exfiltration. Along with other measures such as [Private Clusters](private-clusters.html), this is an important component in an overall strategy for maximizing network security.

Further reading: [review how CockroachDB products differs in advanced security features](../{{site.versions["stable"]}}/security-reference/security-overview.html).


{{site.data.alerts.callout_info}}
Regardless of user-specific Egress Perimiter Control policy, egress is allowed to services managed by Cockroach Labs and essential to your cluster's functionality.
{{site.data.alerts.end}}

The Cloud API provides a real-time status for if the rule enablement is in progress or is complete.

## Using Egress Perimeter Controls with the Cloud Console API

### Prerequisites

- You will need a Cockroach Cloud account with billing enabled, as Egress Perimeter Controls are only available for {{ site.data.products.dedicated }}, not {{ site.data.products.serverless }} clusters, and {{ site.data.products.dedicated }} clusters cost money to run.

- Egress Perimeter Controls are currently only enabled for [Private Clusters](private-clusters.html).

- You will need an API key with permissions to `edit` clusters in your org. You can provision API keys in the cloud console: [Create API Keys](console-access-management.html#create-api-keys)

{{site.data.alerts.callout_danger}}
The operations descrubed here require an API key with very powerful permissions, to modify dedicated clusters, including adding potentially malicious egress rules, which could allow the very attack that this feature is meant to prevent. Do not allow this key to be copied or transmitted in any form. This includes ensuring that nobody can see or photograph the screen of your computer. Delete the API key when the operations are completed.
{{site.data.alerts.end}}

### Initialize your shell with your API key and Cluster id

1. Inspect your cluster in the [clusters page](https://cockroachlabs.cloud/clusters) in the {{ site.data.products.db }} console.

1. Find your cluster's universally unique identifier (UUID). To do this, click on the name of your cluster from the [clusters page](https://cockroachlabs.cloud/clusters) in the console. The UUID will appear in the URL of the overview page for that specific cluster, in the format:

`https://cockroachlabs.cloud/cluster/{ your cluster's UUID }/overview`

1. Save your API key and cluster UUID as environment variables.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    CC_API_KEY={ your API key }
    CLUSTER_ID={ your cluster UUID }
    ~~~

1. Inspect your cluster with the API

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID" \
      --header "Authorization: Bearer $CC_API_KEY"
    ~~~

    ~~~json
    {
      "id": "f0d06734-55ba-42e2-b606-2c1f58e6b9eb",
      "name": "able-quetzal",
      "cockroach_version": "v22.1.8",
      "plan": "DEDICATED",
      "cloud_provider": "AWS",
      "account_id": "000906112402",
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
          "sql_dns": "able-quetzal-6qpd.aws-us-west-2.crdb.io",
          "ui_dns": "admin-able-quetzal-6qpd.aws-us-west-2.crdb.io",
          "internal_dns": "",
          "node_count": 1
        }
      ],
      "created_at": "2022-10-25T16:44:05.068910Z",
      "updated_at": "2022-10-25T17:01:27.566551Z",
      "deleted_at": null
    }
    ~~~


### Change your cluster's egress traffic policy to deny-by-default

{{site.data.alerts.callout_info}}
External traffic destined to CRL-managed resources will always be allowed regardless of user-specified egress policy.
{{site.data.alerts.end}}

1. Make a POST request ordering the API to update your cluster's egress policy.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request POST \
    --header "Authorization: Bearer $CC_API_KEY" \
    --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-traffic-policy" \
    --data '{"allow_all":false}'
    ~~~

    ~~~txt
    ???
    ~~~

1. Check your cluster's status and confirm the update is complete before proceeding.

 {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID" \
      --header "Authorization: Bearer $CC_API_KEY"
    ~~~

### Create egress rules to allowed destinations 

An egress rule is created with the following attributes:

- `name`: A name for the rule
- `type`: Whether the destination will be specified as a fully qualified domain name (FQDN), or as a range of IP addresses specified in CIDR notation. Value is `"FQDN"` or `"CIDR"`.
- `destination`: Either a fully qualified domain name, for example `www.cockroachlabs.com`, or a CIDR range, for example, `123.45.67.890/32`.
- `ports`: An array of allowed ports, for example [44,8080]
    {{site.data.alerts.callout_danger}}
    By default, all ports are allowed.
    {{site.data.alerts.end}}
- `paths`: An array of allowed destination paths.
- `description`:

The following steps will create one rule of each type, FQDN and CIDR.

1. First, create a YAML manifest for a FQDN-based rule. This example, adds egress to a Google Cloud Platform (GCP) storage bucket.

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

1. Next, create a YAML manifest for a CIDR-based rule.

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

1. Use ruby (or another technique), to compile human-editable YAML into API-parsable JSON:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    ruby -ryaml -rjson -e 'puts(YAML.load(ARGF.read).to_json)' < egress-rule1.yml > egress-rule1.json
    ruby -ryaml -rjson -e 'puts(YAML.load(ARGF.read).to_json)' < egress-rule2.yml > egress-rule2.json
    ~~~

1. Use the shell utility JQ to inspect the JSON payload:
    
    {{site.data.alerts.callout_info}}
    On a Mac, install JQ with `brew install jq`
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

1. Make the POST request to create each new rule.
    
    [API spec]

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request POST \
    --header "Authorization: Bearer $CC_API_KEY" \
    --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-rules" \
    --data "@egress-rule1"

    curl --request POST \
    --header "Authorization: Bearer $CC_API_KEY" \
    --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-rules" \
    --data "@egress-rule2"
    ~~~

    ~~~json

    ~~~

    {{site.data.alerts.callout_danger}}
    Your cluster's firewall behavior is not updated instantly when you submit the API request. After, submitting the request, [check your egress rules](#check-a-clusters-egress-rules-allowed-destinations) to confirm that the new rules have been created.
    {{site.data.alerts.end}}

### Check the status of a rule

{{site.data.alerts.callout_info}}
Consult the glossary of [rule statuses](#rule-statuses).
{{site.data.alerts.end}}

[API spec]

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/$CLUSTER_ID/networking/egress-rules' \
  --header "Authorization: Bearer $CC_API_KEY"
~~~

~~~txt

~~~

### Check a cluster's egress rules/allowed destinations

[API spec]

{{site.data.alerts.callout_info}}
Consult the glossary of [rule statuses](#rule-statuses).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/$CLUSTER_ID/networking/egress-rules' \
  --header "Authorization: Bearer $CC_API_KEY"
~~~

~~~txt

~~~

### Removing a rule

A `DELETE` request to the rule's path tells the API to delete the rule.

{{site.data.alerts.callout_danger}}
Your cluster's firewall behavior is not updated instantly when you submit the API request. After, submitting the request, [check your egress rules](#check-a-clusters-egress-rules-allowed-destinations) to confirm that the deletion is complete.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~shell
curl --request DELETE \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/$CLUSTER_ID/networking/egress-rules/$RULE_ID' \
  --header "Authorization: Bearer $CC_API_KEY"
~~~

~~~txt
API RESPONSE!
~~~


## Rule statuses

The API display the following statuses for a rule, when you [inspect an egress rule] or [list a cluster's egress rules]:

- `ACTIVE`: The rule has been successfully implemented in your cluster's network firewall and egress is currently allowed to the specified destination.
- `PENDING_CREATION`: Implementation of a new rule is in process. The behavior of the cluster's network firewall may not yet reflect the new rule, so egress may not yet be allowed to the selected destination.
- `CREATION_FAILED`: Something went wrong in the process of implementing a rule. This is a rare occurrence and does indicate that you should [contact the Cockroach Labs Support Team](https://support.cockroachlabs.com) immediately, rather than attempting to retry rule creation, to avoid leaving your cluster's firewall in an unknown state.
- `PENDING_UPDATE`: An `PATCH` request to update a rule is in process. The behavior may not yet be implemented in your cluster's firewall.
- `PENDING_DELETION`: The rule-removal is being implemented. The behavior of the cluster's network firewall may still reflect the target rule, so egress may still be allowed to the destination.
- `DELETION_FAILED`: A rule update or a rule removal has failed. The behavior of the cluster's network firewall may still reflect the previous state of the rule. This is a rare occurrence and does indicate that you should [contact the Cockroach Labs Support Team](https://support.cockroachlabs.com) immediately, rather than attempting to retry rule creation, to avoid leaving your cluster's firewall in an unknown state.
- `INCONSISTENT`: This indicates that a rule cannot apply consistently across all of the regions or compute resources to which it is meant to apply. This is a rare occurrence and does indicate that you should [contact the Cockroach Labs Support Team](https://support.cockroachlabs.com) immediately, rather than attempting to retry rule creation, to avoid leaving your cluster's firewall in an unknown state.


## Troubleshooting

The process 

can fail at validation (sync) or, watch status and can go to failed

validation gap:
if you allow, e.g. google.com, validator allows it, but it won't get `www.google.com` so it's not the rule you want


