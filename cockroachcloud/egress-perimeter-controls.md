---
title: Egress Perimeter Controls for CockroachDB dedicated
summary: Learn how to configure Egress Perimeter Controls for enhanced network security on a dedicated cluster
toc: true
toc_not_nested: true
docs_area: security 
---

!!!contains raw source, disregard sloppy copy
This page describes the reasons to use Egress Perimeter Controls for enhanced security in {{ site.data.products.dedicated }} clusters, and gives an overview of the user-flows involved.

## Why use Egress Perimeter Cntrols

{{ site.data.products.dedicated }} clusters must access external resources for many purposes:

- Managing backups as part of a disaster recovery plan
- Using [Change data capture (CDC) changefeeds](../{{site.versions["stable"]}}/change-data-capture-overview.html)
- Exporting data
- Exporting logs

By default, clusters can access external resources via the internet without restriction. This potentially leaves a cluster open to a *data exfiltration* scenario, wherein an attacker, often a [malicious insider](https://www.cisa.gov/defining-insider-threats) steals data by sending backups, changefeeds, data, or logs to a source that they control. 

Operators of {{ site.data.products.dedicated }} clusters can remove this risk by using Egress Perimiter Controls. This feature enables [admins](../{{site.versions["stable"]}}/security-reference/authorization.html#admin-role) to restrict egress to a specified list of allowed external destinations.

Along with other measures such as private clusters, ...!!!link and fill out, this is an important component in an overall strategy for maximizing network security.

Further reading: [review how CockroachDB products differs in advanced security features](../{{site.versions["stable"]}}/security-reference/security-overview.html).

<!-- hmm, how to message about the compliance advantage... down the road, can connect to PCI info and stuff, but is it premature? maybe some vaguer messaging-->
<!-- query!!! does this let you set specific types of data as allowed for different targets? are there permissions you can delegate for different egress routes or what? the quote is a bit ambiguos but suggests that yeah you can; presumably this will be clear when you see the API...: -->
<!-- "So an admin could specify which cloud bucket(s) are allowed for backup/restore purposes, or which kafka cluster(s) are allowed for CDC purposes, and so on. And security/risk teams can also get a list of external resources accessible at a given point for their auditing / compliance purposes. This is another network security differentiator in the world of DBaaS. Only Cloud Spanner (and probably AlloyDB) allows for something of this nature using VPC Service Controls, but that is kludgy to setup & maintain and it’s not cloud-agnostic."" -->

{{site.data.alerts.callout_info}}
External traffic destined to CRL managed resources will always, regardless of traffic policy.
{{site.data.alerts.end}}

!!!contains raw source, disregard sloppy copy
Each egress rule builds upon any of the existing ones, and could be configured for a target CIDR range or for a FQDN (Fully-qualified domain name) assigned to the external resource. Additionally, you could configure path based filtering to a resource by specifying particular endpoints off of its base URL. One thing to note is that in addition to the egress rules you manage, CockroachDB dedicated comes with some default rules to enable seamless cluster operations and help comply with the service SLA.

The Cloud API provides a real-time status for if the rule enablement is in progress or is complete.


## How to use Egress Perimeter Controls

### Step 1. Create a new dedicated cluster with Egress Perimeter Controls enabled

This is a new feature as of 22.2.0, so create a new cluster of at least that version.

!!!contains raw source, disregard sloppy copy
Customer creates a dedicated cluster (in advanced tier i.e. it should be private). At this point all egress traffic is allowed out to external resources by the way of backups, import/export, CDC and log export.



### Step 2. Use the API to deny all egress

Create a maximally secure base state for your cluster by adding a rule to deny all (non-essential) egress.
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


### Step 3. Add additional rules to allow egress to specific targets

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

## Appendix: Egress Rule Syntax

name: a descriptive partial identifier for an egress rule. The name, cluster id pair uniquely identify a rule. The name should also serve as documentation for the rule's purpose.

type: can be either CIDR or FQDN. This field is not strictly required as we can rely on regex matching on the host field to determine rule type. Serves to facilitate filtering on the front end and code structure in the backend.

crl_managed: a boolean value specifying if the egress rule is managed by CC operators or customers. Immutable after creation.

host: the destination that is allowed for outgoing connections. Can be either a CIDR range or a fully qualified domain name.

ports: the ports allowed for outgoing connections to a specific host.

paths: the URL paths allowed for outgoing connections to a specific host, port pair.

description: a longer description meant to detail the purpose of the egress rule.


Below is an example of a list of egress rules in json format (UUID fields are ignored).

{% include_cached copy-clipboard.html %}
~~~json
[
	{
		"type": "CIDR",
		"name": "kafka stream",
		"crl_managed": false,
		"host": "182.34.62.99/32", # replace with your target CIDR range
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
			"/customer-self-manged-backups-bucket/*" # replace with your target storage path
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
