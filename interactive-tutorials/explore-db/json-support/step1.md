CockroachDB is already pre-installed and running as a [single-node cluster](https://www.cockroachlabs.com/docs/stable/cockroach-start-single-node.html) in the first terminal, but you'll need to install other prerequisites to run code later in the tutorial.

In a new terminal, install the Python [psycopg2 driver](https://www.psycopg.org/docs/install.html):

`pip install psycopg2-binary`{{execute T2}}

Install the [Requests library](https://requests.readthedocs.io/en/master/):

`pip install requests`{{execute T2}}

Download the Python code you'll run later:

`curl -O https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v20.1/json/json-sample.py`{{execute T2}}

You can then open and take an early look: `json-sample.py`{{open}}
