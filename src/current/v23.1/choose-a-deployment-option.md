---
title: Choose a Deployment Option
summary: Learn how to choose between CockroachDB Serverless, Dedicated, and Self-Hosted deployment option.
toc: true
docs_area: deploy
---

Cockroach Labs offers four ways to deploy CockroachDB: three managed services&mdash;CockroachDB {{ site.data.products.serverless }}, CockroachDB {{ site.data.products.dedicated }} standard, and CockroachDB {{ site.data.products.dedicated }} advanced&mdash;and a self managed option&mdash;CockroachDB {{ site.data.products.core }}. To help you choose which deployment option will best satisfy your requirements, this page describes the application types each deployment is designed for and lists some of the deployment option features that support the application types. For a full feature comparison list, see [CockroachDB: A cloud native, globally-distributed SQL database](https://www.cockroachlabs.com/get-started-cockroachdb/).

<table>
  <tr>
    <th><b>Application type</b></th>
    <th><b>Deployment option</b></th>
    <th><b>Feature</b></th>
  </tr>
  <tr>
      <td><ul>
        <li>Lightweight applications, starter projects, development environments, and proofs of concept.</li>
        <li>Applications with unpredictable scale or regular peaks and troughs of activity.</li>
        <li>Applications that will only need to be deployed in a single region.</li>
        <li>Applications with explicit budget constraints.</li>
      </ul></td>
      <td>
      <a id="serverless"></a><b><a href="https://www.cockroachlabs.com/docs/cockroachcloud/quickstart">CockroachDB {{ site.data.products.serverless }}</a></b>: A fully managed, multi-tenant CockroachDB deployment, in a single region and cloud (AWS or GCP). Delivers an instant, autoscaling database and offers a generous free tier and consumption based billing once free limits are exceeded.
      </td>
      <td><ul>
        <li><b>Scale</b>: Automatic transactional capacity scaling (up and down) depending on database activity. Ability to scale down to zero and consume zero resources.</li>
        <li><b>Availability</b>: High availability. Data replication in triplicate within a single region. Ensures outage survival by spreading replicas across availability zones.</li>
        <li><b>Operations</b>: Cockroach Labs SRE team manages and maintains every cluster. Backups every three hours.</li>
        <li><b>Cost</b>: Free for 10 GiB of storage and 50M <a href="https://www.cockroachlabs.com/docs/cockroachcloud/serverless-faqs#what-is-a-request-unit">Request Units</a>. Consumption based billing and <a href="architecture/glossary.html#resource-limits">resource limits</a> enforce budget requirements.</li>
        <li><b>Resource isolation</b>: Shared CockroachDB software and infrastructure. Data is protected and not shared between deployments.</li>
        <li><b><a href="../cockroachcloud/cloud-org-sso.html">Single Sign-On (SSO)</a></b>: Authentication enforcement using a centralized identity managed by an IdP for clusters and organizations.</li>
        <li><b>Support</b>: Provided by CockroachDB <a href="https://forum.cockroachlabs.com/">community forum</a> and public <a href="https://cockroachdb.slack.com/">Slack workspace</a>.</li>
        <li><b><a href="enterprise-licensing.html">Enterprise Features</a></b>: Enabled (excluding features that are currently <a href="https://www.cockroachlabs.com/docs/cockroachcloud/serverless-unsupported-features">unsupported</a>). </li>
      </ul></td>
  </tr>
  <tr>
      <td><ul>
        <li>All workloads: lightweight and critical production.</li>
        <li>Applications that may need to grow and scale over time.</li>
        <li>Applications with current and future requirements to grow into new cloud regions to serve customers in new markets.</li>
        <li>Applications that require real-time integration with other systems.</li>
      </ul></td>
      <td>
      <a id="dedicated"></a><b><a href="https://www.cockroachlabs.com/docs/cockroachcloud/quickstart-trial-cluster">CockroachDB {{ site.data.products.dedicated }}</a></b>: A fully managed, single tenant CockroachDB deployment in a single region or multi-region cloud (AWS or GCP).
      </td>
      <td><ul>
        <li><b>Scale</b>: Node-based; self-service add and remove nodes.</li>
        <li><b>Availability</b>: Service availability guaranteed with 99.99% uptime. Configurable data replication within or across regions.</li>
        <li><b>Operations</b>: Cockroach Labs SRE provides guaranteed uptime, optimization, security, and operations for cluster, node, and cloud instances. Backups daily and hourly.</li>
        <li><b>Cost</b>: Pricing based on disk size and storage. A single, predictable price packages hardware costs with SRE resources and support.</li>
        <li><b>Resource isolation</b>: Dedicated, single-tenant instance of CockroachDB software and infrastructure.</li>
        <li><b><a href="../cockroachcloud/cloud-org-sso.html">Single Sign-On (SSO)</a></b>: Authentication enforcement using a centralized identity managed by an IdP for clusters and organizations.</li>
        <li><b><a href="../cockroachcloud/export-logs.html">Audit log</a></b>: Configurable cluster and organization log export to AWS CloudWatch or GCP Cloud Logging using the Cloud API.</li>
        <li><b><a href="../cockroachcloud/network-authorization.html">Network security</a></b>: VPC peering or AWS PrivateLink for enhanced network security and lower network latency.</li>
        <li><b>Support</b>: Enterprise grade <a href="https://support.cockroachlabs.com/">support</a> provided by Cockroach Labs.</li>
        <li><b><a href="enterprise-licensing.html">Enterprise Features</a></b>: Enabled.</li>
      </ul></td>
  </tr>
  <tr>
      <td><ul>
        <li>Applications that require PCI-readiness.</li>
      </ul></td>
      <td>
      <a id="dedicated-advanced"></a><b><a href="../cockroachcloud/quickstart-trial-cluster.html">{{ site.data.products.dedicated-advanced }}</a></b>: A fully managed, single tenant, <a href="../cockroachcloud/pci-dss.html">PCI-ready</a> CockroachDB deployment in a single region or multi-region cloud (AWS or GCP).
      </td>
      <td><ul>
        <li><b>All CockroachDB Dedicated features.</b></li>
        <li><b><a href="../cockroachcloud/cmek.html">Customer-Managed Encryption Keys (CMEK)</a></b>: Data protection at rest using a cryptographic key hosted in a supported cloud provider key-management system (KMS).</li>
        <li><b><a href="../cockroachcloud/egress-perimeter-controls.html">Egress Perimeter Controls</a></b>: Allowlist configuration to ensure that the data is sent to a secure location.</li>
      </ul></td>
  </tr>
  <tr>
      <td><ul>
        <li>All workloads: lightweight and critical production.</li>
        <li>Lightweight applications, starter projects, and proofs of concept.</a>
        <li>Teams that require complete control over the database environment and deploy in their own private data centers.</li>
        <li>Advanced security controls and requirements.</li>
        <li>Applications that need to run in multi-cloud and hybrid cloud deployments.</li>
        <li>Applications that need to run in a cloud not supported by Dedicated services.</li>
        <li>Applications that require real-time integration with other systems.</li>
      </ul></td>
      <td>
      <a id="self-hosted"></a><b><a href="start-a-local-cluster.html">CockroachDB Self-Hosted</a></b>: A full featured, self-managed CockroachDB deployment.
      </td>
      <td><ul>
        <li><b>Scale</b>: Node-based; self-service add and remove nodes.</li>
        <li><b>Availability</b>: Completely configurable for each deployment. Manual controls for replication of data within or across regions.</li>
        <li><b>Operations</b>: Self deployed and managed. Manual scaling.</li>
        <li><b>Cost</b>: Per hardware and infrastructure type.</li>
        <li><b>Resource isolation</b>: Dedicated, single-tenant instance of CockroachDB software.</li>
        <li><b>Support</b>: Enterprise grade <a href="https://support.cockroachlabs.com/">support</a> provided by Cockroach Labs.</li>
        <li><b><a href="enterprise-licensing.html">Enterprise Features</a></b>: Enabled.</li>
      </ul></td>
  </tr>
</table>

## See also

- [CockroachDB deployment]({% link {{ page.version.version }}/architecture/glossary.md %}#cockroachdb-deployment-terms)
- [CockroachDB pricing](https://www.cockroachlabs.com/get-started-cockroachdb/)
- [CockroachDB Cloud FAQs](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-faqs)
- [CockroachDB Cloud Architecture](https://www.cockroachlabs.com/docs/cockroachcloud/architecture)
- [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %})
- [Kubernetes Deployment]({% link {{ page.version.version }}/kubernetes-overview.md %})
