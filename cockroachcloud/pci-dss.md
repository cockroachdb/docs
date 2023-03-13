---
title: Payment Card Industry Data Security Standard (PCI DSS) Compliance in CockroachDB Dedicated
summary: Learn about compliance with the Payment Card Industry Data Security Standard (PCI DSS) for CockroachDB Dedicated clusters.
toc: true
docs_area: manage.security
---

The Payment Card Industry Data Security Standard (PCI DSS) is a minimum set of requirements for the safe handling of sensitive data associated with credit and debit cards. In the PCI DSS standard, this data is referred to as "cardholder data". When implemented correctly, PCI DSS helps to protect cardholder data from fraud, exfiltration, and theft. PCI DSS is mandated by credit card issuers but administered by the [Payment Card Industry Security Standards Council](https://www.pcisecuritystandards.org/).

Many organizations who do not store cardholder data still rely upon compliance with PCI DSS to help protect other sensitive or confidential data or metadata.

Responsibility for compliance with PCI DSS is shared among multiple parties, including card issuers, banks, software-as-a-service (SaaS) providers, and retail merchants. Compliance measures are implemented as a series of business practices, security controls, and technological solutions. An organization's compliance with PCI DSS is certified by a PCI Qualified Security Assessor (QSA).

CockroachDB Dedicated has been certified by a QSA as a PCI DSS [Level 1 Service Provider](https://www.pcidssguide.com/what-are-pci-service-provider-compliance-levels/). This certification extends the existing [SOC 2 Type 2 certification](https://www.cockroachlabs.com/blog/soc-2-compliance-2/) of {{ site.data.products.dedicated }}, which provides a baseline level of security controls to safeguard customer data.

This page provides information about {{ site.data.products.dedicated }}'s compliance with PCI DSS, describes some of the ways that {{ site.data.products.db }} implements and enforces compliance, and illustrates some of the types of changes you may need to implement outside of your {{ site.data.products.dedicated }} clusters.

## Overview of PCI DSS

When a system complies with PCI DSS, the system meets the goals of the standard by implementing a series of requirements, as assessed by an independent PCI Qualified Security Assessor (QSA). The following table, which is published in Payment Card Industry Security Standards Council's [PCI DSS Quick Reference Guide, version 3.2.1](https://listings.pcisecuritystandards.org/documents/PCI_DSS-QRG-v3_2_1.pdf), summarizes the goals and requirements of PCI DSS.

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
        <li>Restrict access to cardholder data by business need to know.</li>
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

{{ site.data.products.dedicated }} has implemented the requirements outlined in [PCI DSS 3.2.1](https://listings.pcisecuritystandards.org/documents/SAQ_D_v3_Merchant.pdf) within the DBaaS platform. For customers to take advantage of that compliance, they should take the actions outlined in [Responsibilities of the customer](#responsibilities-of-the-customer).

## Responsibilities of Cockroach Labs

Cockroach Labs takes actions to ensure that the operating procedures and the deployment environment (the platform) for {{ site.data.products.dedicated }} clusters meet or exceed the requirements of PCI DSS 3.2.1. Some of these actions include:

- Enforcing comprehensive security policies and standards.
- Providing periodic security training for all Cockroach Labs employees.
- Hardening our operating environments and networks according to industry standards and recommended practices, to ensure that they are secure and resilient against vulnerabilities and attacks.
- Encrypting cluster data and metadata at rest and in transit.
- Regularly scanning our environment using tools designated by PCI as [Approved Scanning Vendors (ASVs)](https://www.pcidssguide.com/what-is-a-pci-approved-scanning-vendor-asv/) to ensure our continued compliance with PCI DSS 3.2.1, and correcting issues as quickly as possible.
- Regularly scanning our environment and software for known security vulnerabilities and applying updates and security patches in a timely manner.
- Implementing [data loss prevention (DLP)](https://pcidss.com/listing-category/data-loss-protection-dlp) tools and techniques.
- Logging cluster actions and events, redacting sensitive information in audit logs, and retaining audit logs according to the [logging requirements of PCI DSS](https://listings.pcisecuritystandards.org/documents/Effective-Daily-Log-Monitoring-Guidance.pdf).

A comprehensive list of all actions that Cockroach Labs takes to ensure compliance with PCI DSS 3.2.1 is beyond the scope of this document. For more information, contact your Cockroach Labs account team.


Compliance is a shared responsibility. Be sure to read [Responsibilities of the customer](#responsibilities-of-the-customer) to ensure that your cluster is compliant.

## Responsibilities of the customer

To ensure that a {{ site.data.products.dedicated }} cluster complies with PCI DSS 3.2.1, you must enable and configure the following cluster settings and features:

- The dedicated cluster must be created as a [private cluster](private-clusters.html). A private cluster's nodes have no public IP addresses, and its egress traffic moves over private subnets and through a highly-available NAT gateway that is unique to the cluster. An existing cluster cannot be migrated to be a private cluster.
- [Customer-Managed Encryption Keys (CMEK)](cmek.html) must be enabled on the cluster. CMEK protects data at rest in a CockroachDB Dedicated cluster using a cryptographic key that is entirely within your control, hosted in a supported cloud provider key-management system (KMS). It enables file-based encryption of all new or updated data, and provides additional protection on top of the storage-level encryption of cluster disks.
- [Egress Perimeter Controls](egress-perimeter-controls.html) must be enabled, Egress Perimeter Controls ensure that cluster egress operations, such as customer-managed cluster backups or changefeeds, are restricted to a list of specified external destinations.
- [Cluster log export](export-logs.html)'s redaction feature must be enabled to prevent the exposure of sensitive data in logs exported to the customer's instance of AWS Cloudwatch or GCP Cloud Logging.
- [Cloud Organization audit logs](cloud-org-audit-logs.html) automatically capture information when many types of events occur in your {{ site.data.products.db }} organization, such as when a cluster is created or when a member is added to or removed from an organization.
- Cockroach Labs recommends enabling the following Single Sign-On (SSO) features, which helps you minimize the risk of password exposure in {{ site.data.products.db }}:
  - [Cloud Organization SSO](configure-cloud-org-sso.html) allows members of your CockroachDB Cloud organization to authenticate to CockroachDB Cloud using an identity from an identity provider (IdP). This integration can be done using SAML or OIDC.
  - [Cluster SSO](cloud-sso-sql.html) allows users to connect to the SQL interface of a CockroachDB cluster using a JWT (JSON Web Token). A variety of JWT issuers can be configured, including CockroachDB Cloud (for connectivity using cloud CLI), GCP service accounts, Azure managed identities, and others.

Cockroach Labs cannot provide specific advice about ensuring end-to-end compliance of your overall system with PCI DSS or how to implement a specific requirement across all operating environments. The following points help to illustrate some steps that organizations might take to ensure compliance, and is not exhaustive.

- Safeguard cardholder data by a combination of encryption, hashing, masking, and truncation. For an example implementation, refer to [Integrate {{ site.data.products.dedicated }} with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html).
- Protect unencrypted cryptographic materials  both at rest and in transit. Restrict access to unencrypted key materials on a "need to know" basis.
- Restrict access to tables and views that contain cardholder data on a "need to know basis" basis. Refer to [Authorization](/docs/{{site.versions["stable"]}}/authorization.html).
- Take steps to protect networks that transmit cardholder data from malicious access over the public internet. Refer to [Network Authorization](network-authorization.html).
- Regularly test all systems, applications, and dependencies that are involved in storing or processing cardholder data for known vulnerabilities.

## See also

- [Integrate {{ site.data.products.dedicated }} with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html)
- [CockroachDB Releases](/docs/releases/index.html)
- [{{ site.data.products.db }} Releases](/docs/releases/cloud.html)
- [Security and Audit Monitoring](/docs/{{site.versions["stable"]}}/logging-use-cases.html#security-and-audit-monitoring)
- [Network Authorization](network-authorization.html)
