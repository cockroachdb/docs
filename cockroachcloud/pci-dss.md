---
title: Payment Card Industry Data Security Standard (PCI DSS) compliance in CockroachDB Cloud Dedicated
summary: Learn about compliance with Payment Card Industry Data Security Standard (PCI DSS) for CockroachDB Cloud Dedicated clusters.
toc: true
docs_area: manage.security
---

The Payment Card Industry Data Security Standard (PCI DSS) is a series of requirements for the safe handling of sensitive data associated with credit and debit cards. In the PCI DSS standard, and in the rest of this article, this data is referred to as "cardholder data". When implemented correctly, PCI DSS helps to protect your organization and your customers from fraud. PCI DSS is mandated by credit card issuers but administered by the [Payment Card Industry Security Standards Council](https://www.pcisecuritystandards.org/).

{% include v22.1/dedicated-pci-compliance.md %}

Responsibility for compliance with PCI DSS is shared among multiple parties, including card issuers, banks, software-as-a-service (SaaS) providers, and retail merchants. Compliance measures are implemented as a series of business practices, security controls, and technological solutions. An organization's compliance with PCI DSS is certified by a PCI Qualified Security Assessor (QSA).

This article provides information about {{ site.data.products.dedicated }}'s compliance with PCI DSS, describes some of the ways that {{ site.data.products.db }} implements and enforces compliance, and illustrates some of the types of changes you may need to implement outside of your {{ site.data.products.dedicated }} clusters. For detailed instructions and working examples, refer to [Integrate {{ site.data.products.dedicated }} with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html).

## Overview of PCI DSS

When a system complies with PCI DSS, the system meets the goals of the standard by implementing a series of twelve requirements, according to a PCI Qualified Security Assessor (QSA). The following table, which is published in Payment Card Industry Security Standards Council's [PCI DSS Quick Reference Guide, version 3.2.1](https://listings.pcisecuritystandards.org/documents/PCI_DSS-QRG-v3_2_1.pdf), summarizes the goals and requirements of PCI DSS.

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
          <li>Install and maintain a firewall configuration to protect cardholder data</li>
          <li>Do not use vendor-supplied defaults for system passwords and other security parameters</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Protect Cardholder Data</td>
  <td><ol start="3">
        <li>Protect stored cardholder data</li>
        <li>Encrypt transmission of cardholder data across open, public networks</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Maintain a Vulnerability Management Program</td>
  <td><ol start="5">
        <li>Protect all systems against malware and regularly update antivirus software or programs</li>
        <li>Develop and maintain secure systems and applications</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Implement Strong Access Control Measures</td>
  <td><ol start="7">
        <li>Restrict access to cardholder data by business need to know</li>
        <li>Identify and authenticate access to system components</li>
        <li>Restrict physical access to cardholder data</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Regularly Monitor and Test Networks</td>
  <td><ol start="10">
        <li>Track and monitor all access to network resources and cardholder data.</li>
        <li>Regularly test security systems and processes</li>
      </ol>
  </td>
</tr>
<tr>
  <td>Maintain an Information Security Policy</td>
  <td><ol start="12">
        <li>Maintain a policy that addresses information security for all personne..</li>
  </td>
</tr>
</tbody>
</tgroup>
</table>

{{ site.data.products.dedicated }} is certified by a PCI Qualified Security Assessor (QSA) to be compliant with PCI DSS, as long as you take the actions outlined in [How can you ensure your cluster's compliance with PCI DSS?](#how-can-you-ensure-your-clusters-compliance-with-pci-dss).

## How can you ensure your cluster's compliance with PCI DSS?

Compliance is a shared responsibility. Although {{ site.data.products.dedicated }} clusters automatically comply with PCI DSS, you must take additional steps to ensure that your entire solution is compliant with PCI DSS, such as implementing security recommendations and carefully choosing business partners and vendors. For example, you must ensure that cardholder data is protected throughout its journey into and out of your {{ site.data.products.dedicated }} clusters.

Cockroach Labs cannot provide specific advice about what is required for compliance with PCI DSS or how to implement a specific requirement. The following points help to illustrate some steps that organizations might take to help to ensure compliance.

{{site.data.alerts.callout_danger}}
The following list is provided only to illustrate a small subset of the measures you might need to take to ensure compliance.
{{site.data.alerts.end}}

- Before you insert cardholder data into the cluster, you must first protect it by a combination of encryption, hashing, masking, and truncation. For an example implementation, refer to [Integrate CockroachDB Dedicated with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html).
- The cryptographic materials used to protect cardholder data must themselves be protected at rest and in transit, and access to the unencrypted key materials must be strictly limited only to approved individuals.
- Within the cluster, you must restrict access to cardholder data on a "need to know basis" basis. Access to tables and views in the cluster that contain cardholder data must be restricted, and you must regularly test for compliance. Refer to [Authorization](/docs/{{site.versions["stable"]}}/authorization.html).
- You must track, monitor, and log all access to cardholder data and network resources. Within a cluster with PCI DSS enabled, {{ site.data.products.db }} enforces this requirement automatically. Refer to [Security and audit monitoring](/docs/{{site.versions["stable"]}}/logging-use-cases.html#security-and-audit-monitoring).
- You must protect networks that transmit cardholder data from malicious access over the public internet, and you must regularly test for compliance. For more information about protecting the cluster's networks, refer to [Network Authorization](network-authorization.html).
- You must regularly test all systems, applications, and dependencies (including, but not limited to, application libraries, runtimes, container images, and testing frameworks) that are involved in storing or processing cardholder data for known vulnerabilities, you must regularly apply updates, and you must regularly test for compliance. Important security and stability updates are applied regularly and automatically to {{ site.data.products.dedicated }} clusters. These updates include, but are not limited to, the cluster's CockroachDB runtime, the operating systems of cluster nodes, APIs, and management utilities. You are notified about upcoming cluster maintenance before it happens, when it starts, and when it completes. To configure notifications in the {{ site.data.products.db }} Console, refer to [Monitoring and Alerting](/docs/stable/monitoring-and-alerting.html). You can also read the release notes for [CockroachDB](/docs/releases/index.html) and for [{{ site.data.products.db }}](/docs/releases/cloud.html).

## See also

- [Integrate {{ site.data.products.dedicated }} with Satori](/docs/{{site.versions["stable"]}}/satori-integration.html)
- [CockroachDB Releases](/docs/releases/index.html)
- [{{ site.data.products.db }} Releases](/docs/releases/cloud.html)
- [Security and audit monitoring](/docs/{{site.versions["stable"]}}/logging-use-cases.html#security-and-audit-monitoring)
- [Network Authorization](network-authorization.html)
