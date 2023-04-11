{{site.data.alerts.callout_info}}
{{ site.data.products.db }} is transitioning to a new authorization model that offers fine-grained access-control (FGAC), meaning that users can be given access to exactly the actions and resources required to perform their tasks. This is significant security enhancement, and may be required to meet advanced security goals, such as regulatory benchmarks, for example [Payment Card Industry Data Security Standard (PCI DSS) compliance](pci-dss.html).

Currently, the FGAC authorization model, comprising an updated set of [organization user roles](authorization.html#organization-user-roles) is in [**limited access**](cockroachdb-feature-availability.html), and is only available to organizations that choose to opt-in. To enroll your organization, contact your Cockroach Labs account team. These features are subject to change.

Until you enroll your organization, only the legacy roles, Organization Administrator and Organization Developer, will be available.
{{site.data.alerts.end}}