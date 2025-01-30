    A {% if page.name == 'authorization.md' %}**Folder Mover**{% else %}[**Folder Mover**](authorization.md#folder-mover){% endif %} can rename or move descendant folders, and can move clusters within the folder hierarchy where they have the role. However, a Folder Mover cannot create or delete folders or clusters, and cannot assign roles. A Folder Mover can move clusters within the folder hierarchy even if they do not have a role that allows them to connect to the cluster, such as {% if page.name == 'authorization.md' %}[Cluster Creator](#cluster-creator) or [Cluster Operator](#cluster-operator){% else %}[Cluster Administrator](authorization.md#cluster-administrator) or [Cluster Operator](authorization.md#cluster-operator{% endif %}).

    {{site.data.alerts.callout_info}}
    A cluster cannot be renamed.
    {{site.data.alerts.end}}

    A user with the {% if page.name == 'authorization.md' %}[Org Administrator](#org-administrator) or [Folder Admin](#folder-admin){% else %}[Org Administrator](authorization.md#org-administrator) or [Folder Admin](authorization.md#folder-admin){% endif %} role can grant another user or a service account the Folder Mover role. Because the Folder Admin role is a superset of Folder Mover, there is no need for a Folder Admin to grant themselves the Folder Mover role.
