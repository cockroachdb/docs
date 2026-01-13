- Decide how you want to access your DB Console:

    Access Level | Description
    -------------|------------
    Partially open | Set a firewall rule to allow only specific IP addresses to communicate on port `8080`.
    Completely open | Set a firewall rule to allow all IP addresses to communicate on port `8080`.
    Completely closed | Set a firewall rule to disallow all communication on port `8080`. In this case, a machine with SSH access to a node could use an SSH tunnel to access the DB Console.
