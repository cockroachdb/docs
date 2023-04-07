The **Connect to cluster** dialog shows information about how to connect to your cluster.

1. Select **General connection string** from the **Select option** dropdown.
1. Open the **General connection string** section, then copy the connection string provided and save it in a secure location.
    
    This Quickstart uses default certificates, so you can skip the **Download CA Cert** instructions.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only once*. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](managing-access.html).
    {{site.data.alerts.end}}