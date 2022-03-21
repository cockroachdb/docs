---
title: How to Choose a Deployment Type
summary: Learn how to choose between CockroachDB Serverless, Dedicated, and Self-Hosted deployment types.
toc: true
docs_area: deploy
---

Cockroach Labs offers three ways to deploy CockroachDB: two managed services&mdash;CockroachDB Serverless and CockroachDB Dedicateds&mdash;and a self managed options&mdash;CockroachDB Self-Hosted. To help you choose which type would best satisfy your requirements, this page describes the requirements each deployment is designed for and lists some of the features that support the requirements. For a full feature comparison list, see [CockroachDB: A cloud native, globally-distributed SQL database](https://www.cockroachlabs.com/get-started-cockroachdb).

<table>
  <tr>
    <th><b>Application requirements</b></th>
    <th><b>Deployment type</b></th>
    <th><b>Features</b></th>
  </tr>
  <tr>
      <td><ul>
        <li>Lightweight applications, starter projects, and proofs of concept.</li>
        <li>Applications with unpredictable scale or regular peaks and troughs of activity.</li>
        <li>Applications that will only need to be deployed in a single region.</li>
        <li>Applications with explicit budget constraints.</li>
      </ul></td>
      <td><ul>
        <li><b><a href="../cockroachcloud/create-a-serverless-cluster.html">CockroachDB Serverless (beta)</a></b>: A fully managed, multi-tenant CockroachDB deployment, in a single region and cloud (AWS or GCP). It delivers an autoscaling (up and down) and instant database. and offers a generous free tier and consumption based billing once these limits are exceeded (up to user set limits).</li>
      </ul></td>
      <td><ul>
        <li><b>Scale</b>: Automatic transactional capacity scaling (up and down) depending on database activity. Ability to scale down to zero and consume no resources.</li>
        <li><b>Availability</b>: Service availability guaranteed with 99.99% uptime. Data replication in triplicate within a single region to ensure survival of small regional issues.</li>
        <li><b>Operations</b>: Cockroach Labs SRE provides guaranteed uptime and backups every three hours.</li>
        <li><b>Cost</b>: Free for 5GiB of storage and 250M <a href="../cockroachcloud/serverless-faqs.html#what-is-a-request-unit">Request Units</a>. Consumption based billing and spend limits enforce budget requirements.</li>
        <li><b>Resource isolation</b>: Shared CockroachDB software and infrastructure. Data is is not shared between deployments.</li>
        <li><b>CockroachDB version</b>: Managed by Cockroach Labs and upgraded periodically.</li>
        <li><b>Support</b>: Provided by CockroachDB <a href="https://forum.cockroachlabs.com/">community forum</a> and <a href="https://cockroachdb.slack.com/">Slack instance</a>.</li>
        <li><b>Enterprise features</b>: ✗</li>
      </ul></td>
  </tr>
  <tr>
      <td><ul>
        <li>Simple and critical production workloads.</li>
        <li>Applications that may need to grow and scale over time.</li>
        <li>Applications with current and future requirements to grow into new cloud regions to serve customers in new markets.</li>
        <li>Applications that require Enterprise features.</li>
      </ul></td>
      <td><ul>
        <li><b><a href="../cockroachcloud/create-your-cluster.html">CockroachDB Dedicated</a></b>: A fully managed, single tenant CockroachDB deployment, managed by Cockroach Labs, in a single, multi-region cloud (AWS or GCP).</li>
      </ul></td>
      <td><ul>
        <li><b>Scale</b>: Node-based; simply add or remove nodes.</li>
        <li><b>Availability</b>: Service availability guaranteed with 99.99% uptime. Data replication in triplicate within a single region to ensure survival of small regional issues.</li>
        <li><b>Operations</b>: Cockroach Labs SRE provides guaranteed uptime, optimization, security, and operations for cluster, node, and cloud instances with daily and hourly backups.</li>
        <li><b>Cost</b>: Pricing based on disk size and storage. A single, predictable price packages hardware costs with SRE resources and Support.</li>
        <li><b>Resource isolation</b>: Dedicated, single-tenant instance of CockroachDB software and infrastructure.</li>
        <li><b>CockroachDB version</b>: Choose when creating a cluster.</li>
        <li><b>Support</b>: Enterprise grade <a href="https://support.cockroachlabs.com/">support</a> provided by Cockroach Labs.</li>
        <li><b>Enterprise features</b>:  ✓ See <a href="enterprise-licensing.html">Enterprise Features</a>.</li>
      </ul></td>
  </tr>
  <tr>
      <td><ul>
        <li>Critical production workloads.</li>
        <li>Lightweight applications, starter projects, and proofs of concept run on a laptop.</a>
        <li>Teams that require complete control over the database environment and deploy in their own private data centers.</li>
        <li>Applications that need to run in multi-cloud and hybrid cloud deployments.</li>
        <li>Applications that need to run in a cloud, e.g. Azure, not supported by managed services.</li>
        <li>Applications that require Enterprise features.</li>
      </ul></td>
      <td><ul>
        <li><b><a href="install-cockroachdb-mac.html">CockroachDB Self-Hosted</a></b>: A self-managed CockroachDB deployment, with node-based scale, built for mission-critical workloads.</li>
      </ul></td>
      <td><ul>
        <li><b>Scale</b>: Node-based; simply add or remove nodes.</li>
        <li><b>Availability</b>: N/A.</li>
        <li><b>Operations</b>: Self deployed and managed. Manual scaling.</li>
        <li><b>Cost</b>: Per hardware and infrastructure type.</li>
        <li><b>Resource isolation</b>: Dedicated, single-tenant instance of CockroachDB software.</li>
        <li><b>CockroachDB version</b>: Choose when installing CockroachDB.</li>
        <li><b>Support</b>: Enterprise grade <a href="https://support.cockroachlabs.com/">support</a> provided by Cockroach Labs.</li>
        <li><b>Enterprise features</b>:  ✓ See <a href="enterprise-licensing.html">Enterprise Features</a>.</li>
      </ul></td>
  </tr>
</table>

## See also

- [CockroachDB deployment](glossary.html#cockroachdb-deployment)
- [CockroachDB pricing](https://www.cockroachlabs.com/get-started-cockroachdb/)
- [CockroachDB Cloud FAQs](../cockroachcloud/serverless-faqs.html)
- [CockroachDB Cloud Architecture](../cockroachcloud/architecture.html)
- [Manual Deployment](manual-deployment.html)
- [Kubernetes Deployment](kubernetes-overview.html)
