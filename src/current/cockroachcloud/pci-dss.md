---
title: Payment Card Industry Data Security Standard (PCI DSS) Compliance in CockroachDB Advanced
summary: Learn about compliance with the Payment Card Industry Data Security Standard (PCI DSS) for CockroachDB Advanced clusters.
toc: true
docs_area: manage.security
---

The Payment Card Industry Data Security Standard (PCI DSS) is a minimum set of requirements for the safe handling of sensitive data associated with credit and debit cards. In the PCI DSS standard, this data is referred to as "cardholder data". When implemented correctly, PCI DSS helps to protect cardholder data from fraud, exfiltration, and theft. PCI DSS is mandated by credit card issuers but administered by the [Payment Card Industry Security Standards Council](https://www.pcisecuritystandards.org/).

Many organizations that do not store cardholder data still rely upon PCI DSS to help protect other sensitive or confidential data or metadata.

Responsibility for compliance with PCI DSS is shared among multiple parties, including card issuers, banks, software-as-a-service (SaaS) providers, and retail merchants. Compliance measures are implemented as a series of business practices, security controls, and technological solutions. An organization's compliance with PCI DSS is certified by a PCI Qualified Security Assessor (QSA).

CockroachDB {{ site.data.products.advanced }} has been certified by a PCI Qualified Security Assessor (QSA) as a PCI DSS [Level 1 Service Provider](https://www.pcidssguide.com/what-are-pci-service-provider-compliance-levels/). This certification extends the existing [SOC 2 Type 2 certification](https://www.cockroachlabs.com/blog/soc-2-compliance-2/) of CockroachDB {{ site.data.products.advanced }}. SOC 2 Type 2 provides a baseline level of security controls to safeguard customer data.

This page provides information about compliance with PCI DSS within CockroachDB {{ site.data.products.advanced }}, describes some of the ways that CockroachDB {{ site.data.products.cloud }} implements and enforces compliance, and illustrates some of the types of changes you may need to implement outside of your clusters.

<a id="hipaa"></a>
{{site.data.alerts.callout_success}}
When a CockroachDB {{ site.data.products.advanced }} cluster is configured appropriately for compliance with PCI DSS, the cluster also meets the requirements of the Health Insurance Portability and Accountability Act of 1996, commonly referred to as _HIPAA_.
{{site.data.alerts.end}}

## Overview of PCI DSS

When a system complies with PCI DSS, the system meets the goals of the standard by implementing a series of requirements, as assessed by an independent PCI QSA. The following table, which is published in Payment Card Industry Security Standards Council's [PCI DSS Quick Reference Guide, version 4.x](https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Supporting%20Document/PCI-DSS-v4_x-QRG.pdf), summarizes the goals and requirements of PCI DSS.

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
  <td>Build and maintain a secure network and systems.</td>
  <td><ol>
          <li>Install and maintain network security controls.</li>
          <li>Apply secure configurations to all system components.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Protect account data.</td>
  <td><ol start="3">
        <li>Protect stored account data.</li>
        <li>Protect cardholder data with strong cryptography during transmission over open, public networkss.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Maintain a vulnerability management program.</td>
  <td><ol start="5">
        <li>Protect all systems and networks from malicious software.</li>
        <li>Develop and maintain secure systems and applications.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Implement strong access control measures.</td>
  <td><ol start="7">
        <li>Restrict access to system components and cardholder data by business need to know.</li>
        <li>Identify and authenticate access to system components.</li>
        <li>Restrict physical access to cardholder data.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Regularly monitor and test networks.</td>
  <td><ol start="10">
        <li>Log and monitor all access to system components and cardholder data.</li>
        <li>Test security of systems and networks regularly.</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Maintain an information security policy.</td>
  <td><ol start="12">
        <li>Support information security with organizational policies and programs.</li>
  </td>
</tr>
</tbody>
</tgroup>
</table>

CockroachDB {{ site.data.products.advanced }} is certified by a PCI QSA to be compliant with [PCI DSS 4.0](https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Reporting%20Template%20or%20Form/PCI-DSS-v4-0-1-ROC-AOC-Merchants.pdf) within the DBaaS platform. Customers are still responsible to ensure that their applications are PCI DSS compliant. Customers may need to take the additional actions outlined in [Responsibilities of the customer](#responsibilities-of-the-customer) to maintain their own PCI compliance when using CockroachDB {{ site.data.products.advanced }} clusters for cardholder data or other sensitive data.

## Responsibilities of Cockroach Labs

Cockroach Labs takes actions to ensure that the operating procedures and the deployment environment for CockroachDB {{ site.data.products.advanced }} clusters meet or exceed the requirements of PCI DSS 4.0. Some of these actions include:

- Enforcing comprehensive security policies and standards.
- Providing periodic security training for all Cockroach Labs employees.
- Hardening our operating environments and networks according to industry standards and recommended practices, to ensure that they are secure and resilient against vulnerabilities and attacks.
- Encrypting cluster data and metadata at rest and in transit.
- Regularly scanning our environment using tools designated by PCI as [Approved Scanning Vendors (ASVs)](https://www.pcidssguide.com/what-is-a-pci-approved-scanning-vendor-asv/) to ensure our continued compliance with PCI DSS 4.0, by correcting issues and patching known security vulnerabilities as quickly as possible.
- Implementing [data loss prevention (DLP)](https://pcidss.com/listing-category/data-loss-protection-dlp).
- [Logging]({% link cockroachcloud/cloud-org-audit-logs.md %}) cluster actions and events, redacting sensitive information in audit logs, and retaining audit logs according to the [PCI DSS logging requirements](https://listings.pcisecuritystandards.org/documents/Effective-Daily-Log-Monitoring-Guidance.pdf).

A comprehensive list of all actions that Cockroach Labs takes to ensure compliance with PCI DSS 4.0 is beyond the scope of this document. For more information, contact your Cockroach Labs account team.

Compliance is a shared responsibility. Be sure to read [Responsibilities of the customer](#responsibilities-of-the-customer) to support you in maintaining your own PCI DSS compliance within your cluster.

## Responsibilities of the customer

For a CockroachDB {{ site.data.products.advanced }} cluster to meet PCI DSS standards, you must take additional steps, such as implementing security recommendations and carefully choosing business partners and vendors, and ensuring that your cardholder data or other sensitive information is protected throughout its journey into and out of your CockroachDB {{ site.data.products.advanced }} clusters.

It is the customer’s responsibility to know what is required for your compliance with PCI DSS and how to implement a specific requirement. The following points help to illustrate some steps that organizations might take.

A CockroachDB {{ site.data.products.advanced }} cluster must have the following features enabled to be used in a PCI DSS compliant manner:

- The cluster must be created as a CockroachDB {{ site.data.products.advanced }} cluster with [advanced security features]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-6-configure-advanced-security-features) enabled. This configures the cluster such that its nodes have no public IP addresses, and its egress traffic moves over private subnets and through a highly-available NAT gateway that is unique to the cluster. An existing {{ site.data.products.advanced }} cluster without advanced security features cannot be migrated into an {{ site.data.products.advanced }} cluster with advanced security, and vice-versa.
- Single Sign-On (SSO) helps you avoid storing user passwords in CockroachDB {{ site.data.products.cloud }}:

    - [Cloud Organization SSO]({% link cockroachcloud/configure-cloud-org-sso.md %}) allows members of your CockroachDB {{ site.data.products.cloud }} organization to authenticate to CockroachDB {{ site.data.products.cloud }} using an identity from an identity provider (IdP). This integration can be done using SAML or OIDC.
    - [Cluster SSO]({% link cockroachcloud/cloud-sso-sql.md %}) allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB {{ site.data.products.cloud }} or self-hosted) with the full security of SSO, and the convenience of being able to choose from a variety of SSO identity providers, including CockroachDB {{ site.data.products.cloud }}, Google, Azure, GitHub, or your own self-hosted OIDC.

- Enable [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/cmek.md %}), which allow you to protect data at rest in a CockroachDB {{ site.data.products.advanced }} cluster using a cryptographic key that is entirely within your control, hosted in a supported key-management system (KMS) platform. It enables file-based encryption of all new or updated data, and provides additional protection on top of the storage-level encryption of cluster disks.
- Enable [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %}), which ensure that cluster egress operations, such as [self-managed cluster backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) or [change data capture]({% link {{ site.current_cloud_version }}/change-data-capture-overview.md %}), are restricted to a list of specified external destinations.
- Use [cluster log exports]({% link cockroachcloud/export-logs-advanced.md %}) to automatically capture detailed information about queries being executed in your cluster. You must have the redaction feature enabled to prevent the exposure of sensitive data in logs exported to your instance of Amazon CloudWatch or GCP Cloud Logging. (Refer to the `redact` setting under [Enable log export]({% link cockroachcloud/export-logs-advanced.md %}#enable-log-export).)
- [Cloud Organization audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %}) automatically capture information when many types of events occur in your CockroachDB {{ site.data.products.cloud }} organization, such as when a cluster is created or when a member is added to or removed from an organization. You can export your CockroachDB {{ site.data.products.cloud }} organization's audit logs to analyze usage patterns and investigate security incidents.

Cockroach Labs cannot provide specific advice about ensuring end-to-end compliance of your overall system with PCI DSS or how to implement a specific requirement across all operating environments. The following are additional guidelines for a cluster to be used in a PCI DSS compliant manner:

- Before you insert cardholder data into the cluster, protect it by a combination of encryption, hashing, masking, and truncation.
- The cryptographic materials used to protect cardholder data must themselves be protected at rest and in transit, and access to the unencrypted key materials must be strictly limited only to approved individuals.
- Within the cluster, restrict access to cardholder data in a manner consistent with the [principle of least privilege](https://wikipedia.org/wiki/Principle_of_least_privilege). Access to tables and views in the cluster that contain cardholder data must be restricted, and you are responsible to regularly test for compliance. Refer to [Authorization]({% link {{ site.current_cloud_version }}/authorization.md %}).
- Protect networks that transmit cardholder data from malicious access over the public internet, and regularly test for compliance. For more information about protecting the cluster’s networks, refer to [Network Authorization]({% link cockroachcloud/network-authorization.md %}).
- Important security and stability updates are applied regularly and automatically to CockroachDB {{ site.data.products.advanced }} clusters. These updates include, but are not limited to, the cluster’s CockroachDB runtime, the operating systems of cluster nodes, APIs, and management utilities. Customers are notified about upcoming cluster maintenance before it happens, when it starts, and when it completes.
- If your cluster is part of a solution that includes external systems and applications that store or process cardholder data, it is your responsibility to ensure that these systems and applications, as well as their dependencies, are compliant with PCI DSS. You are responsible for regularly testing these systems and applications for known vulnerabilities and compliance violations and regularly applying updates and mitigations.

## See also

- [Authorization]({% link {{ site.current_cloud_version }}/authorization.md %})
- [CockroachDB Releases]({% link releases/index.md %})
- [CockroachDB {{ site.data.products.cloud }} Releases]({% link releases/cloud.md %})
- [Security and Audit Monitoring]({% link {{ site.current_cloud_version }}/logging-use-cases.md %}#security-and-audit-monitoring)
- [Network Authorization]({% link cockroachcloud/network-authorization.md %})
