---
title: Payment Card Industry Data Security Standard (PCI DSS) compliance in CockroachDB Cloud Dedicated
summary: Learn about compliance with Payment Card Industry Data Security Standard (PCI DSS) for CockroachDB Cloud Dedicated clusters.
toc: true
docs_area: manage.security
---

The Payment Card Industry Data Security Standard (PCI DSS) is a series of requirements for the safe handling of sensitive data associated with credit and debit cards. In the rest of this article, this data is referred to as "card data". When implemented correctly, PCI DSS helps to protect your organization and your customers from fraud. PCI DSS is mandated by credit card issuers but administered by the [Payment Card Industry Security Standards Council](https://www.pcisecuritystandards.org/).

{% include v22.1/dedicated-pci-compliance.md %}

Responsibility for compliance with PCI DSS is shared among multiple parties, including card issuers, banks, software-as-a-service (SaaS) providers, and retail merchants. Compliance measures are implemented as a series of business practices, security controls, and technological solutions. An organization's compliance with PCI DSS is certified by a PCI Qualified Security Assessor (QSA).

This article provides information about {{ site.data.products.dedicated }}'s compliance with PCI DSS, describes some of the ways that {{ site.data.products.db }} implements and enforces compliance, and illustrates some of the types of changes you may need to implement outside of your {{ site.data.products.dedicated }} clusters. For detailed instructions and working examples, refer to [Integrate CockroachDB Dedicated with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html).

## Overview of PCI DSS

When a system complies with PCI DSS, the system meets a series of requirements, according to a PCI Qualified Security Assessor (QSA). For example:

1. A firewall is installed and configured to scan all network traffic and prevent untrusted networks from accessing the system.
1. System passwords and security parameters do not use vendor-supplied default values or values that are easily discoverable.
1. Card data is protected at rest in cluster storage by come combination of encryption, hashing, masking, and truncation.
1. Card data is protected in transit over open, public networks by strong encryption and establishment of cryptographic trust.
1. All systems are regularly scanned and updated to protect against malware, security vulnerabilities and exploits, and software defects.
1. All systems and applications implement recommended security practices that limit access to card data on a "need to know" basis and help to prevent unscrupulous individuals to gain privileged access. 
1. Access to system components must require identification and authentication. Each individual with access to system components must be assigned a unique identification.
1. Physical access to card data must be restricted and secure, and unauthorized access to or removal of data must be prevented.
1. All access to card data and network resources must be tracked, monitored, and logged to prevent, detect, or minimize the impact of data compromises.
1. Security systems and processes must be tested frequently to uncover and repair vulnerabilities that could be exploited by malicious individuals.
1. The system's owner maintains an information security policy for all personnel, so that each individual understands the sensitivity of the relevant data and their responsibility to protect it.

To learn more about the PCI DSS requirements, refer to the Payment Card Industry Security Standards Council's [PCI DSS Quick Reference Guide](https://listings.pcisecuritystandards.org/documents/PCI_DSS-QRG-v3_2_1.pdf).

{{ site.data.products.dedicated }} is certified by a PCI Qualified Security Assessor (QSA) to be compliant with PCI DSS.

## How can you ensure your cluster's compliance with PCI DSS?

Compliance is a shared responsibility. Although {{ site.data.products.dedicated }} clusters automatically comply with PCI DSS, you must take additional steps to ensure that your entire solution is compliant with PCI DSS, such as implementing security recommendations and carefully choosing business partners and vendors. For example, you must ensure that card data is protected throughout its journey into and out of your {{ site.data.products.dedicated }} clusters.

Cockroach Labs cannot provide specific advice about what is required for compliance with PCI DSS or how to implement a specific requirement. The following points help to illustrate some steps that organizations might take to help to ensure compliance..

{{site.data.alerts.callout_danger}}
The following list is provided only to illustrate a small subset of the measures you might need to take to ensure compliance.
{{site.data.alerts.end}}

- Before you insert card data into the cluster, you must first protect it by a combination of encryption, hashing, masking, and truncation. For an example implementation, refer to [Integrate CockroachDB Dedicated with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html).
- The cryptographic materials used to protect card data must themselves be protected at rest and in transit, and access to the unencrypted key materials must be strictly limited only to approved individuals.
- Within the cluster, you must restrict access to card data on a "need to know basis" authorized individuals have access to tables and views in the cluster that contain card data, and you must regularly test for compliance. Refer to [Authorization](/docs/{{site.versions["stable"]}}/authorization.html).
- You must track, monitor, and log all access to card data and network resources. Within a cluster with PCI DSS enabled, {{ site.data.products.db }} enforces this requirement automatically. Refer to [Security and audit monitoring](/docs/{{site.versions["stable"]}}/logging-use-cases.html#security-and-audit-monitoring).
- You must protect networks that transmit card data from malicious access over the public internet, and you must regularly test for compliance. For more information about protecting the cluster's networks, refer to [Network Authorization](network-authorization.html).
- You must regularly test all systems, applications, and dependencies (including, but not limited to, application libraries, runtimes, container images, and testing frameworks) that are involved in storing or processing card data for known vulnerabilities, you must regularly apply updates, and you must regularly test for compliance. Important security and stability updates are applied regularly and automatically to {{ site.data.products.dedicated }} clusters. These updates include, but are not limited to, the cluster's CockroachDB runtime, the operating systems of cluster nodes, APIs, and management utilities. You are notified about upcoming cluster maintenance before it happens, when it starts, and when it completes.

## See also

- [Integrate CockroachDB Dedicated with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html)
- [Security and audit monitoring](/docs/{{site.versions["stable"]}}/logging-use-cases.html#security-and-audit-monitoring)
- [Network Authorization](network-authorization.html)
