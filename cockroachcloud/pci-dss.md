---
title: Payment Card Industry Data Security Standard (PCI DSS) Compliance in CockroachDB Cloud Dedicated
summary: Learn about compliance with the Payment Card Industry Data Security Standard (PCI DSS) for CockroachDB Cloud Dedicated clusters.
toc: true
docs_area: manage.security
---

The Payment Card Industry Data Security Standard (PCI DSS) is a minimum set of requirements for the safe handling of sensitive data associated with credit and debit cards. In the PCI DSS standard, this data is referred to as "cardholder data". When implemented correctly, PCI DSS helps to protect cardholder data from fraud, exfiltration, and theft. PCI DSS is mandated by credit card issuers but administered by the [Payment Card Industry Security Standards Council](https://www.pcisecuritystandards.org/).

Many organizations who do not store cardholder data still rely upon PCI DSS to help protect other sensitive or confidential data or metadata.

Responsibility for compliance with PCI DSS is shared among multiple parties, including card issuers, banks, software-as-a-service (SaaS) providers, and retail merchants. Compliance measures are implemented as a series of business practices, security controls, and technological solutions. An organization's compliance with PCI DSS is certified by a PCI Qualified Security Assessor (QSA).

Cockroach Labs has been certified by a QSA as a PCI DSS [Level 1 Service Provider](https://www.pcidssguide.com/what-are-pci-service-provider-compliance-levels/). This certification extends the existing [SOC 2 Type 2 certification](https://www.cockroachlabs.com/blog/soc-2-compliance-2/) of {{ site.data.products.dedicated }}. SOC 2 Type 2 provides a baseline level of security controls to safeguard customer data.

This page provides information about {{ site.data.products.dedicated }}'s compliance with PCI DSS, describes some of the ways that {{ site.data.products.db }} implements and enforces compliance, and illustrates some of the types of changes you may need to implement outside of your {{ site.data.products.dedicated }} clusters. For detailed instructions and working examples, refer to [Integrate {{ site.data.products.dedicated }} with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html).

## Overview of PCI DSS

When a system complies with PCI DSS, the system meets the goals of the standard by implementing a series of twelve requirements, as assessed by an independent PCI Qualified Security Assessor (QSA). The following table, which is published in Payment Card Industry Security Standards Council's [PCI DSS Quick Reference Guide, version 3.2.1](https://listings.pcisecuritystandards.org/documents/PCI_DSS-QRG-v3_2_1.pdf), summarizes the goals and requirements of PCI DSS.

<table>
<tgroup cols="2">
<thead>
<tr>
  <th>Goal</th>
  <th>PCI DSS Requirement</th>
</tr>
</thead>
<tbody>
<tr>
  <td>Build and Maintain a Secure Network and Systems</td>
  <td><ol>
          <li>Install and maintain a firewall configuration to protect cardholder data.</li>
          <li>Do not use vendor-supplied defaults for system passwords and other security parameters.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Protect Cardholder Data</td>
  <td><ol start="3">
        <li>Protect stored cardholder data.</li>
        <li>Encrypt transmission of cardholder data across open, public networks.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Maintain a Vulnerability Management Program</td>
  <td><ol start="5">
        <li>Protect all systems against malware and regularly update antivirus software or programs.</li>
        <li>Develop and maintain secure systems and applications.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Implement Strong Access Control Measures</td>
  <td><ol start="7">
        <li>Restrict access to cardholder data by business need to know<./li>
        <li>Identify and authenticate access to system components.</li>
        <li>Restrict physical access to cardholder data.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Regularly Monitor and Test Networks</td>
  <td><ol start="10">
        <li>Track and monitor all access to network resources and cardholder data.</li>
        <li>Regularly test security systems and processes.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Maintain an Information Security Policy</td>
  <td><ol start="12">
        <li>Maintain a policy that addresses information security for all personnel.</li>
  </td>
</tr>
</tbody>
</tgroup>
</table>

{{ site.data.products.dedicated }} is certified by a PCI Qualified Security Assessor (QSA) to be compliant with [PCI DSS 3.2.1](https://listings.pcisecuritystandards.org/documents/SAQ_D_v3_Merchant.pdf), as long as you take the actions outlined in [How To Ensure Your Cluster's Compliance with PCI DSS](#how-to-ensure-your-clusters-compliance-with-pci-dss).

## Responsibilities of Cockroach Labs

Cockroach Labs takes actions to ensure that our operating procedures and the deployment environment for {{ site.data.products.dedicated }} clusters meet or exceed the requirements of PCI DSS 3.2.1. Some of these actions include:

- Enforcing comprehensive security policies and standards.
- Providing periodic security training for all Cockroach Labs employees.
- Hardening our operating environments and networks according to industry standards and recommended practices, to ensure that they are secure and resilient against vulnerabilities and attacks.
- Encrypting cluster data and metadata at rest and in transit.
- Regularly scanning our environment using vendors designated by PCI as [Approved Scanning Vendors (ASVs)](https://www.pcidssguide.com/what-is-a-pci-approved-scanning-vendor-asv/) to ensure our continued compliance with PCI DSS 3.2.1, and correcting issues as quickly as possible.
- Regularly scanning our environment and software for known security vulnerabilities and applying updates and security patches in a timely manner.
- Implementing [data loss prevention (DLP)](https://pcidss.com/listing-category/data-loss-protection-dlp).
- Logging cluster actions and events, redacting sensitive information in audit logs, and retaining audit logs according to the [logging requirements of PCI DSS 3.2.1](https://listings.pcisecuritystandards.org/documents/Effective-Daily-Log-Monitoring-Guidance.pdf).

A comprehensive list of all actions that Cockroach Labs takes to ensure compliance with PCI DSS 3.2.1 is beyond the scope of this document. For more information, contact your Cockroach Labs account team.

Compliance is a shared responsibility. Be sure to read [Responsibilities of the customer](#responsibilities-of-the-customer) to ensure that your cluster is compliant.

## Responsibilities of the customer

To ensure that a {{ site.data.products.dedicated }} cluster complies with PCI DSS 3.2.1, you must take additional steps, such as implementing security recommendations and carefully choosing business partners and vendors and ensuring that cardholder data is protected throughout its journey into and out of your {{ site.data.products.dedicated }} clusters.

Cockroach Labs cannot provide specific advice about what is required for compliance with PCI DSS or how to implement a specific requirement. The following points help to illustrate some steps that organizations might take to help to ensure compliance.

{{site.data.alerts.callout_danger}}
The following list is provided only to illustrate a small subset of the measures you might need to take to ensure compliance.
{{site.data.alerts.end}}

- Ensure that your cluster is a {{ site.data.products.dedicated }} cluster.
- Single Sign-On (SSO) helps you avoid storing user passwords in {{ site.data.products.db }}:
  - [Cloud Organization Single Sign-On (SSO)](configure-cloud-org-sso.html), which allows members of your CockroachDB Cloud organization to authenticate using an identity from an identity provider (IdP) instead of using an email address and password.
  - [Cluster SSO](cloud-sso-sql.html), which allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB Cloud or self-hosted) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of SSO identity providers, including CockroachDB Cloud, Google, Azure, GitHub, or your own self-hosted OIDC.
- Enable [Customer-Managed Encryption Keys (CMEK)](cmek.html), which allow you to protect data at rest in a CockroachDB Dedicated cluster using a cryptographic key that is entirely within your control, hosted in a supported key-management system (KMS) platform.
- Protect your cluster's network from the public internet by enabling the following features:
  - [Private Clusters](private-clusters.html), which ensure that cluster nodes have no public IP addresses and that egress traffic moves over private subnets and through a highly-available NAT gateway that is unique to the cluster.
  - [Egress Perimeter Controls](egress-perimeter-controls.html), which ensure that cluster egress operations, such as cluster backups, are restricted to a list of specified external destinations.
- Protect data that is written from your cluster to storage on your cloud provider by enabling and using the following features:
  - [Cluster log export](export-logs.html), which automatically exports logs from all nodes in all regions of your CockroachDB Dedicated cluster to your chosen cloud log sink. You must enable redaction of sensitive data in the log export configuration.
  - [Cloud Organization audit log export](cloud-org-audit-logs.html), which captures audit logs when many types of events occur in your {{ site.data.products.db }} organization, such as when a cluster is created or when a user is added to or removed from an organization.
  - Your cloud provider's [IAM roles](../stable/cloud-storage-authentication.html), which provide an extra layer of authentication when your cluster or {{ site.data.products.db }} write data to your cloud provider, such as managed backups or [change data capture (CDC)](../stable/change-data-capture-overview.html) operations.

In addition, follow these guidelines to ensure that your cluster is compliant with PCI DSS 3.2.1:

- Before you insert cardholder data into the cluster, you must first protect it by a combination of encryption, hashing, masking, and truncation. For an example implementation, refer to [Integrate {{ site.data.products.dedicated }} with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html).
- The cryptographic materials used to protect cardholder data must themselves be protected at rest and in transit, and access to the unencrypted key materials must be strictly limited only to approved individuals.
- Within the cluster, you must restrict access to cardholder data on a "need to know basis" basis. Access to tables and views in the cluster that contain cardholder data must be restricted, and you must regularly test for compliance. Refer to [Authorization](/docs/{{site.versions["stable"]}}/authorization.html).
- You must protect networks that transmit cardholder data from malicious access over the public internet, and you must regularly test for compliance. For more information about protecting the cluster's networks, refer to [Network Authorization](network-authorization.html).
- You must regularly test all systems, applications, and dependencies (including, but not limited to, application libraries, runtimes, container images, and testing frameworks) that are involved in storing or processing cardholder data for known vulnerabilities, you must regularly apply updates, and you must regularly test for compliance. Important security and stability updates are applied regularly and automatically to {{ site.data.products.dedicated }} clusters. These updates include, but are not limited to, the cluster's CockroachDB runtime, the operating systems of cluster nodes, APIs, and management utilities. You are notified about upcoming cluster maintenance before it happens, when it starts, and when it completes. To configure notifications in the {{ site.data.products.db }} Console, refer to [Monitoring and Alerting](/docs/stable/monitoring-and-alerting.html). You can also read the release notes for [CockroachDB](/docs/releases/index.html) and for [{{ site.data.products.db }}](/docs/releases/cloud.html).

## See also

- [Integrate {{ site.data.products.dedicated }} with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html)
- [CockroachDB Releases](/docs/releases/index.html)
- [{{ site.data.products.db }} Releases](/docs/releases/cloud.html)
- [Security and Audit Monitoring](/docs/{{site.versions["stable"]}}/logging-use-cases.html#security-and-audit-monitoring)
- [Network Authorization](network-authorization.html)
