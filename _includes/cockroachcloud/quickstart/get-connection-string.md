The **Connect to your cluster** dialog shows information about how to connect to your cluster.

1. Select **General connection string** from the **Select option/language** dropdown.
1. Open a new terminal on your local machine, and run the **CA Cert download command** provided in the **Download CA Cert** section.
1. Copy the connection string displayed in the **General connection string** section and save it in a secure location.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only once*. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}