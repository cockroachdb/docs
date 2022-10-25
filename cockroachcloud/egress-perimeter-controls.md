---
title: Egress Perimeter Controls for CockroachDB dedicated
summary: Learn how to configure Egress Perimeter Controls for enhanced network security on a dedicated cluster
toc: true
toc_not_nested: true
docs_area: security 
---

This page describes the reasons to use Egress Perimeter Controls for enhanced security in {{ site.data.products.dedicated }} clusters, and gives an overview of the user-flows involved.

## Why use Egress Perimeter Cntrols

{{ site.data.products.dedicated }} clusters must access external resources for many purposes:

- Managing backups as part of a disaster recovery plan
- Using [Change data capture (CDC) changefeeds](../{{site.versions["stable"]}}/change-data-capture-overview.html)
- Exporting data
- Exporting logs

By default, clusters can access external resources via the internet without restriction. This potentially leaves a cluster open to a *data exfiltration* scenario, wherein an attacker, often a [malicious insider](https://www.cisa.gov/defining-insider-threats) steals data by sending backups, changefeeds, data, or logs to a source that they control. 

Operators of {{ site.data.products.dedicated }} clusters can remove this risk by using Egress Perimiter Controls. This feature enables [admins](../{{site.versions["stable"]}}/security-reference/authorization.html#admin-role) to restrict egress to a specified external destinations. This adds a strong layer of protection against malicious data exfiltration. Along with other measures such as private clusters, ...!!!link and fill out, this is an important component in an overall strategy for maximizing network security.

Further reading: [review how CockroachDB products differs in advanced security features](../{{site.versions["stable"]}}/security-reference/security-overview.html).


{{site.data.alerts.callout_info}}
Regardless of user-specific Egress Perimiter Control policy, egress is allowed to services managed by Cockroach Labs and essential to your cluster's functionality.
{{site.data.alerts.end}}

The Cloud API provides a real-time status for if the rule enablement is in progress or is complete.

## Using Egress Perimeter Controls with the Cloud Console API

### Prerequisites

- You will need a Cockroach Cloud account with billing enabled, as Egress Perimeter Controls are only available for {{ site.data.products.dedicated }}, not {{ site.data.products.serverless }} clusters, and {{ site.data.products.dedicated }} clusters cost money to run.

- You will need an API key with permissions to `edit` clusters in your org. You can provision API keys in the cloud console: [Create API Keys](console-access-management.html#create-api-keys)

{{site.data.alerts.callout_danger}}
The operations descrubed here require an API key with very powerful permissions, to modify dedicated clusters, including adding potentially malicious egress rules, which could allow the very attack that this feature is meant to prevent. Do not allow this key to be copied or transmitted in any form. This includes ensuring that nobody can see or photograph the screen of your computer. Delete the API key when the operations are completed.
{{site.data.alerts.end}}

### Step 1. Verify your cluster is ready for Egress Perimeter Controls

1. Inspect your cluster in the [clusters page](https://cockroachlabs.cloud/clusters) in the {{ site.data.products.db }} console.

{{site.data.alerts.callout_success}}
This feature is only available on {{ site.data.products.dedicated }} clusters created after 10/26/2022.

Find your cluster's **Created** date. If your cluster was created before 10/26/2022, you must first [create a new {{ site.data.products.dedicated }} cluster](create-your-cluster.html) and configure its Egress Perimeter Controls, then migrate your data.
{{site.data.alerts.end}}

1. Find your cluster's universally unique identifier (UUID). To do this, click on the name of your cluster from the [clusters page](https://cockroachlabs.cloud/clusters) in the console. The UUID will appear in the URL of the overview page for that specific cluster, in the format:

`https://cockroachlabs.cloud/cluster/{ your cluster's UUID }/overview`

### Step 2. Initialize the shell with your API key and cluster id

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
  "id": "508db376-fe5b-4068-99b5-e1dc5cb4983e",
  "name": "docs-rule-123",
  "cockroach_version": "latest-v22.2-build(sha256:b3c7a63977eb8112fd43f1a1607b0e3a385ee4bed2145e6c0b9007351952e418)",
  "plan": "DEDICATED",
  "cloud_provider": "AWS",
  "account_id": "006333311807",
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
      "sql_dns": "docs-test-egress-6qnx.aws-us-west-2.crdb.io",
      "ui_dns": "admin-docs-test-egress-6qnx.aws-us-west-2.crdb.io",
      "internal_dns": "",
      "node_count": 1
    }
  ],
  "created_at": "2022-10-25T00:53:58.552063Z",
  "updated_at": "2022-10-25T01:11:59.399995Z",
  "deleted_at": null
}
~~~


### Step 3. Use the API to change your cluster's egress behavior to deny-by-default

POST /api/v1/clusters/{cluster_id}/networking/egress-traffic-policy
- enable/disable egress rule management


{% include_cached copy-clipboard.html %}
~~~shell
	curl --request POST \
	  --url "https://management-staging.crdb.io/api/v1/clusters/$CLUSTER_ID/networking/egress-traffic-policy" \
	  --header "Authorization: Bearer $CC_API_KEY"
~~~

~~~txt
???
~~~

### Step 4. Customize your allowed destinations 

Rules can be based on fully qualified domain name (FQDN) or CIDR range. Let's add one rule of each type.


{% include_cached copy-clipboard.html %}
~~~shell

~~~

~~~txt

~~~


{% include_cached copy-clipboard.html %}
~~~shell

~~~

~~~txt

~~~


### Check current egress rules/allowed destinations



[API spec]

`GET /api/v1/clusters/{cluster_id}/networking/egress-rules`

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
  --url 'https://cockroachlabs.cloud/api/v1/clusters/$CLUSTER_ID/networking/egress-traffic-policy' \
  --header "Authorization: Bearer $CC_API_KEY"
~~~

~~~txt

~~~


- return all egress rules associated with the given cluster

Check 


Create a maximally secure base state for your cluster by changing it's behavior to deny egress unless the destination has been specifically allowed.


"to convert it to DENY-ALL mode"

{{site.data.alerts.callout_info}}
External traffic destined to CRL managed resources will always, regardless of traffic policy.
{{site.data.alerts.end}}


1. use that API!!!
{% include_cached copy-clipboard.html %}
~~~shell
API CALL!
~~~

~~~txt
API RESPONSE!
~~~

1. use that API!!!
{% include_cached copy-clipboard.html %}
~~~shell
API CALL!
~~~

"When customer is ready to migrate data from another database or write fresh data to the cluster (especially if it is production), a user with Org Admin role invokes a new API [what endpoint and body?] to convert it to DENY-ALL mode such that no egress traffic is allowed to external resources. This is likely just a temporary thing to set the stage for next step.""


### Step 3. Add additional rules to allow egress to specific destinations

1. use that API!!!
{% include_cached copy-clipboard.html %}
~~~shell
API CALL!
~~~

~~~txt
API RESPONSE!
~~~

1. use that API!!!
{% include_cached copy-clipboard.html %}
~~~shell
API CALL!
~~~

~~~txt
API RESPONSE!
~~~
"The Org Admin then configures egress rules for the cluster to define the egress perimeter policy using another set of APIs (as documented in the RFC), based on what external resources may be required by the application team for their own managed backups, CDC, export/import etc.

If the customer enables CMEK, Log export to cloudwatch/cloud logging or Metrics export to Datadog, then we'll automatically add egress rules to relevant external resources in those cases, and the customer won't have to take a separate action."

### Removing a rule

1. use that API!!!
{% include_cached copy-clipboard.html %}
~~~shell
API CALL!
~~~

~~~txt
API RESPONSE!
~~~

1. use that API!!!
{% include_cached copy-clipboard.html %}
~~~shell
API CALL!
~~~

~~~txt
API RESPONSE!
~~~



## Troubleshooting

can fail at validation (sync) or, watch status and can go to failed


validation gap:
if you allow, e.g. google.com, validator allows it, but it won't get `www.google.com` so it's not the rule you want



## Appendix: Egress Rule Syntax

*name*: a descriptive partial identifier for an egress rule. The name, cluster id pair uniquely identify a rule. The name should also serve as documentation for the rule's purpose.

*type*: can be either CIDR or FQDN. This field is not strictly required as we can rely on regex matching on the host field to determine rule type. Serves to facilitate filtering on the front end and code structure in the backend.

*crl_managed*: a boolean value specifying if the egress rule is managed by CC operators or customers. Immutable after creation.

*host*: the destination that is allowed for outgoing connections. Can be either a CIDR range or a fully qualified domain name.

*ports*: the ports allowed for outgoing connections to a specific host.

*paths*: the URL paths allowed for outgoing connections to a specific host, port pair.

*description*: a longer description meant to detail the purpose of the egress rule.

*state*: desribes the state of the egress rule. Valid states include
PENDING_CREATION, CREATION_FAILED, ACTIVE, PENDING_UPDATE, UPDATE_FAILED,
PENDING_DELETION, DELETION_FAILED, INCONSISTENT.

Note: if a rule fails to be updated, the rule state will be set to
`DELETION_FAILED`. It is unknown whether a rule in this state is not enforced,
partially enforced, or fully enforced. For example, it could be that the rule
is enforced in one cluster region but not another. Deletion failures are always
due to internal errors and result in a notification to engineers.
Below is an example of a list of egress rules in json format (UUID fields are ignored).

{% include_cached copy-clipboard.html %}
~~~json
[
	{
		"type": "CIDR",
		"name": "kafka stream",
		"crl_managed": false,
		"host": "182.34.62.123/32", # replace with your destination CIDR range
		"ports": [443],
		"paths": [],
		"description": ""
	},
	{
		"type": "FQDN",
		"name": "backups",
		"crl_managed": false,
		"host": "storage.googleapis.com",
		"ports": [443, 80],
		"paths": [
			"/customer-self-manged-backups-bucket/*" # replace with your destination storage path
		],
		"description": ""
	},
	{
		"type": "FQDN",
		"name": "crl-managed-telemetry",
		"crl_managed": true,
		"host": "register.cockroachdb.com",
		"ports": [443],
		"paths": [],
		"description": "telemetry data from this CRDB cluster is sent to a CRL owned service"
	}
]
~~~
