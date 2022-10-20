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

### Step 1. Create a 

!!!contains raw source, disregard sloppy copy
Customer creates a dedicated cluster (in advanced tier i.e. it should be private). At this point all egress traffic is allowed out to external resources by the way of backups, import/export, CDC and log export.

When customer is ready to migrate data from another database or write fresh data to the cluster (especially if it is production), a user with Org Admin role invokes a new API [what endpoint and body?] to convert it to DENY-ALL mode such that no egress traffic is allowed to external resources. This is likely just a temporary thing to set the stage for next step.

The Org Admin then configures egress rules for the cluster to define the egress perimeter policy using another set of APIs (as documented in the RFC), based on what external resources may be required by the application team for their own managed backups, CDC, export/import etc.

If the customer enables CMEK, Log export to cloudwatch/cloud logging or Metrics export to Datadog, then we'll automatically add egress rules to relevant external resources in those cases, and the customer won't have to take a separate action.

to convert it to DENY-ALL mode such that no egress traffic is allowed to external resources.
