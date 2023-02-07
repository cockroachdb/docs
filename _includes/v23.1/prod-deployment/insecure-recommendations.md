- Consider using a [secure cluster](manual-deployment.html) instead. Using an insecure cluster comes with risks:
    - Your cluster is open to any client that can access any node's IP addresses.
    - Any user, even `root`, can log in without providing a password.
    - Any user, connecting as `root`, can read or write any data in your cluster.
    - There is no network encryption or authentication, and thus no confidentiality.

- Decide how you want to access your DB Console:

    Access Level | Description
    -------------|------------
    Partially open | Set a firewall rule to allow only specific IP addresses to communicate on port `8080`.
    Completely open | Set a firewall rule to allow all IP addresses to communicate on port `8080`.
    Completely closed | Set a firewall rule to disallow all communication on port `8080`. In this case, a machine with SSH access to a node could use an SSH tunnel to access the DB Console.
