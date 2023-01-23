---
title: Develop a Global Web Application
summary: This page includes instructions for building a multi-region web application on CockroachDB, using Flask and SQLAlchemy.
toc: true
---

This page guides you through developing a globally-available web application. It is the fourth section of the [Develop and Deploy a Global Application](movr-flask-overview.html) tutorial.

<!-- {% include {{ page.version.version }}/misc/movr-live-demo.md %} -->

## Before you begin

Before you begin this section, complete the previous section of the tutorial, [Set Up a Virtual Environment for Developing Global Applications](movr-flask-setup.html).

## Project structure

The application needs to handle requests from clients, namely web browsers. To translate these kinds of requests into database transactions, the application stack consists of the following components:

- A multi-region database schema that defines the tables and indexes for user, vehicle, and ride data.
    The database schema is covered on a separate page, [Create a Multi-Region Database Schema](movr-flask-database.html).
- A multi-node, geo-distributed CockroachDB cluster, with each node's locality corresponding to cloud provider regions.
    Database deployment is covered on two separate pages:
      - For instructions on setting up a demo cluster, see [Set Up a Virtual Environment for Developing Multi-Region Applications](movr-flask-setup.html).
      - For instructions on setting up a multi-region cluster, see [Deploy a Global Application](movr-flask-deployment.html).
- Python class definitions that map to the tables in our database.
    For details, see [Mappings](#mappings) below.
- Functions that wrap database transactions.
    For details, see [Transactions](#transactions) below.
- A backend API that defines the application's connection to the database.
    For details, see [Database connection](#database-connection) below.
- A [Flask](https://palletsprojects.com/p/flask/) server that handles requests from clients.
    For details, see [Web application](#web-application) below.
- HTML files that the Flask server can render into web pages.
    For details, see [User interface](#user-interface) below.

In the sections that follow, we go over each of the files and folders in the project, with a focus on the backend and database components. Here is the application's project directory structure:

~~~ shell
movr
├── Dockerfile  ## Defines the Docker container build
├── LICENSE  ## A license file for your application
├── Pipfile ## Lists PyPi dependencies for pipenv
├── Pipfile.lock
├── README.md  ## Contains instructions on running the application
├── __init__.py
├── dbinit.sql  ## Initializes the database, and partitions the tables by region
├── init.sh  ## Initializes the environment variables for debugging
├── movr
│   ├── __init__.py
│   ├── models.py  ## Defines classes that map to tables in the movr database
│   ├── movr.py  ## Defines the primary backend API
│   └── transactions.py ## Defines transaction callback functions
├── requirements.txt  ## Lists PyPi dependencies for Docker container
├── server.py  ## Defines a Flask web application to handle requests from clients and render HTML files
├── static  ## Static resources for the web frontend
│   ├── css
│   ├── img
│   └── js
├── templates  ## HTML templates for the web UI
│   ├── layouts
│   ├── _nav.html
│   ├── login.html
│   ├── register.html
│   ├── rides.html
│   ├── user.html
│   ├── users.html
│   ├── vehicles-add.html
│   └── vehicles.html
└── web
    ├── __init__.py
    ├── config.py   ## Contains Flask configuration settings
    ├── forms.py  ## Defines FlaskForm classes
    └── gunicorn.py  ## Contains gunicorn configuration settings
~~~


## SQLAlchemy with CockroachDB

Object Relational Mappers (ORMs) map classes to tables, class instances to rows, and class methods to transactions on the rows of a table. The `sqlalchemy` package includes some base classes and methods that you can use to connect to your database's server from a Python application, and then map tables in that database to Python classes.

In our example, we use SQLAlchemy's [Declarative](https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/) extension, which is built on the `mapper()` and `Table` data structures. We also use the [`sqlalchemy-cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb) Python package, which defines the CockroachDB SQLAlchemy [dialect](https://docs.sqlalchemy.org/en/13/dialects/). The package includes some functions that help you handle [transactions](transactions.html) in a running CockroachDB cluster.

### Mappings

After completing the [Create a Multi-Region Database Schema](movr-flask-database.html) section, you should be familiar with the `movr` database and each of the tables in the database (`users`, `vehicles`, and `rides`).

Open [`movr/models.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/models.py), and look at the first 10 lines of the file:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/models.py ||# START front ||# END front %}
~~~

The first data structure that the file imports is `declarative_base`, a constructor for the [declarative base class](https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/api.html#sqlalchemy.ext.declarative.declarative_base), built on SQLAlchemy's Declarative extension. All mapped objects inherit from this object. We assign a declarative base object to the `Base` variable right below the imports.

The `models.py` file also imports some other standard SQLAlchemy data structures that represent database objects (like columns), data types, and constraints, in addition to a standard Python library to help with default values (i.e., `datetime`).

Since the application handles user logins and authentication, we also need to import some security libraries from the Flask ecosystem. We'll cover the web development libraries in more detail in the [Web application](#web-application) section below.

#### The `User` class

Recall that each instance of a table class represents a row in the table, so we name our table classes as if they were individual rows of their parent table, since that's what they'll represent when we construct class objects.

Take a look at the `User` class definition:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/models.py ||# START User ||# END User %}
~~~

The `User` class has the following attributes:

- `__tablename__`, which holds the stored name of the table in the database. SQLAlchemy requires this attribute for all classes that map to tables.
- All of the other attributes of the `User` class (`id`, `city`, `first_name`, etc.), stored as `Column` objects. These attributes represent columns of the `users` table. The constructor for each `Column` takes the column data type as its first argument, and then any additional arguments, such as `primary_key`.
- To help define column objects, SQLAlchemy also includes classes for SQL data types and column constraints. For the columns in this table, we use `UUID` and `String` data types.
- The `__repr__` function, which defines the string representation of the object.

#### The `Vehicle` class

Next, look at the `Vehicle` class definition:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/models.py ||# START Vehicle ||# END Vehicle %}
~~~

Recall that the `vehicles` table contains more columns and data types than the `users` table. It also contains a [foreign key constraint](foreign-key.html) (on the `users` table), and a default value. These differences are reflected in the `Vehicle` class.

#### The `Ride` class

Lastly, there's the `Ride` class:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/models.py ||# START Ride ||# END Ride %}
~~~

The `rides` table has three foreign key constraints, one on the `users` table and two on the `vehicles` table.

### Transactions

After you create a class for each table in the database, you can start defining functions that bundle together common SQL operations as atomic [transactions](transactions.html).

#### The SQLAlchemy CockroachDB dialect

The [`sqlalchemy-cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb/tree/master/cockroachdb) Python library handles transactions in SQLAlchemy with the `run_transaction()` function. This function takes a `transactor`, which can be an [`Engine`](https://docs.sqlalchemy.org/en/13/core/connections.html#sqlalchemy.engine.Engine), [`Connection`](https://docs.sqlalchemy.org/en/13/core/connections.html#sqlalchemy.engine.Connection), or [`sessionmaker`](https://docs.sqlalchemy.org/en/13/orm/session_api.html#sqlalchemy.orm.session.sessionmaker) object, and a callback function. It then uses the `transactor` to connect to the database, and executes the callback as a database transaction. For some examples of `run_transaction()` usage, see [Transaction callback functions](#transaction-callback-functions) below.

`run_transaction()` abstracts the details of [transaction retries](transactions.html#client-side-intervention) away from your application code. Transactions may require retries if they experience deadlock or read/write contention with other concurrent transactions that cannot be resolved without allowing potential serializable anomalies. As a result, a CockroachDB transaction may have to be tried more than once before it can commit. This is part of how we ensure that our transaction ordering guarantees meet the ANSI [SERIALIZABLE](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Serializable) isolation level.

`run_transaction()` has the following additional benefits:

- When passed a [`sqlalchemy.orm.session.sessionmaker`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html#session-and-sessionmaker) object, it ensures that a new session is created exclusively for use by the callback, which protects you from accidentally reusing objects via any sessions created outside the transaction. Note that a `sessionmaker` objects is different from a `session` object, which is not an allowable `transactor` for `run_transaction()`.
- By abstracting transaction retry logic away from your application, it keeps your application code portable across different databases.

 Because all callback functions are passed to `run_transaction()`, the `Session` method calls within those callback functions are written a little differently than the typical SQLAlchemy application. Most importantly, those functions must not change the session and/or transaction state. This is in line with the recommendations of the [SQLAlchemy FAQs](https://docs.sqlalchemy.org/en/latest/orm/session_basics.html#session-frequently-asked-questions), which state (with emphasis added by the original author) that

<q>As a general rule, the application should manage the lifecycle of the session *externally* to functions that deal with specific data. This is a fundamental separation of concerns which keeps data-specific operations agnostic of the context in which they access and manipulate that data.</q>

 and

<q>Keep the lifecycle of the session (and usually the transaction) **separate and external**.</q>

 In keeping with the above recommendations from the official docs, we strongly recommend avoiding any explicit mutations of the transaction state inside the callback passed to `run_transaction()`. Specifically, we do not make calls to the following functions from inside `run_transaction()`:

 - [`sqlalchemy.orm.Session.commit()`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html?highlight=commit#sqlalchemy.orm.session.Session.commit) (or other variants of `commit()`)

    This is not necessary because `run_transaction()` handles the savepoint/commit logic for you.

 - [`sqlalchemy.orm.Session.rollback()`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html?highlight=rollback#sqlalchemy.orm.session.Session.rollback) (or other variants of `rollback()`)

    This is not necessary because `run_transaction()` handles the commit/rollback logic for you.

 - `Session.flush()`

    This will not work as expected with CockroachDB because [CockroachDB does not support nested transactions](savepoint.html), which are necessary for `Session.flush()` to work properly. If the call to `Session.flush()` encounters an error and aborts, it will try to rollback. This will not be allowed by the currently-executing CockroachDB transaction created by `run_transaction()`, and will result in an error message like the following: `sqlalchemy.orm.exc.DetachedInstanceError: Instance <FooModel at 0x12345678> is not bound to a Session; attribute refresh operation cannot proceed (Background on this error at: http://sqlalche.me/e/bhk3)`.

 In the example application, all calls to `run_transaction()` are found within the methods of the `MovR` class (defined in [`movr/movr.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/movr.py)), which represents the connection to the running database. Requests to the web application frontend (defined in [`server.py`](https://github.com/cockroachlabs/movr-flask/blob/master/server.py)), are routed to the `MovR` class methods.

#### Transaction callback functions

 To separate concerns, we define all callback functions passed to `run_transaction()` calls in a separate file, [`movr/transactions.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/transactions.py). These callback functions wrap `Session` method calls, like [`session.query()`](https://docs.sqlalchemy.org/en/13/orm/session_api.html#sqlalchemy.orm.session.Session.query) and [`session.add()`](https://docs.sqlalchemy.org/en/13/orm/session_api.html#sqlalchemy.orm.session.Session.add), to perform database operations within a transaction.

{{site.data.alerts.callout_success}}
We recommend that you use a `sessionmaker` object, bound to an existing `Engine`, as the `transactor` that you pass to `run_transaction()`. This protects you from accidentally reusing objects via any sessions created outside the transaction. Every time `run_transaction()` is called, it uses the `sessionmaker` object to create a new [`Session`](https://docs.sqlalchemy.org/en/13/orm/session.html) object for the callback. If the `sessionmaker` is bound to an existing `Engine`, the same database connection can be reused.
{{site.data.alerts.end}}

`transactions.py` imports all of the table classes that we defined in [`movr/models.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/models.py), in addition to some standard Python data structures needed to generate correctly-typed row values that the ORM can write to the database.

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/transactions.py ||# START front ||# END front %}
~~~

##### Reading

A common query that a client might want to run is a read of the `rides` table. The transaction callback function for this query is defined here as `get_rides_txn()`:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/transactions.py ||# START get_rides_txn ||# END get_rides_txn %}
~~~

The `get_rides_txn()` function takes a `Session` object and a `rider_id` string as its inputs, and it outputs a list of dictionaries containing the columns-value pairs of a row in the `rides` table. To retrieve the data from the database bound to a particular `Session` object, we use `Session.query()`, a method of the `Session` class. This method returns a `Query` object, with methods for filtering and ordering query results.

Note that `get_rides_txn()` gets all rides for a specific rider, which might be located across multiple regions. As discussed in [MovR: A Global Application Use-Case](movr-flask-use-case.html#latency-in-global-applications), running queries on data in multiple regions of a multi-region deployment can lead to latency problems. Because this function defines [a read operation](architecture/reads-and-writes-overview.html#read-scenario), it requires fewer trips between replicated nodes than a write operation, but will likely be slower than a read operation on data constrained to a single region.

Another common query would be to read the registered vehicles in a particular city, to see which vehicles are available for riding. Unlike `get_rides_txn()`, the `get_vehicles_txn()` function takes the `city` string as an input.

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/transactions.py ||# START get_vehicles_txn ||# END get_vehicles_txn %}
~~~

This function filters the query on the `city` column. `vehicle` rows with the same value for `city` are inserted from the same region, making `city` values implicitly correspond to a specific region. Because the `vehicles` table has a `REGIONAL BY ROW` locality, CockroachDB can locality-optimize queries from nodes with a locality matching the [hidden `crdb_region` column](movr-flask-database.html#table-localities). This limits latency, as the query only needs to travel to database deployments in a single region.

##### Writing

There are two basic types of write operations: creating new rows and updating existing rows. In SQL terminology, these are [`INSERT`](insert.html)/[`UPSERT`](insert.html) statements and [`UPDATE`](update.html) statements.  All transaction callback functions that update existing rows include a `session.query()` call. All functions adding new rows call `session.add()`. Some functions do both.

For example, `start_ride_txn()`, which is called when a user starts a ride, adds a new row to the `rides` table, and then updates a row in the `vehicles` table.

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/transactions.py ||# START start_ride_txn ||# END start_ride_txn %}
~~~

The function takes the `city` string, `rider_id` UUID, `rider_city` string, and `vehicle_id` UUID as inputs. It queries the `vehicles` table for all vehicles of a specific ID. It also creates a `Ride` object, representing a row of the `rides` table. To add the ride to the table in the database bound to the `Session`, the function calls `Session.add()`. To update a row in the `vehicles` table, it modifies the object attribute. `start_ride_txn()` is called by `run_transaction()`, which commits the transaction to the database.

Be sure to review the other callback functions in [`movr/transactions.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/transactions.py) before moving on to the next section.

Now that we've covered the table classes and some transaction functions, we can look at the interface that connects web requests to a running CockroachDB cluster.

### Database connection

The `MovR` class, defined in [`movr/movr.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/movr.py), handles connections to CockroachDB using SQLAlchemy's [`Engine`](https://docs.sqlalchemy.org/en/13/core/connections.html#sqlalchemy.engine.Engine) class.

Let's start with the beginning of the file:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/movr.py ||# START front ||# END front %}
~~~

`movr.py` first imports the transaction callback functions that we defined in [`movr/transactions.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/transactions.py). It then imports the `run_transaction()` function. The `MovR` class methods call `run_transaction()` to execute the transaction callback functions as transactions.

The file also imports some `sqlalchemy` libraries to create instances of the `Engine` and `Session` classes, and to [register the CockroachDB as a dialect](https://docs.sqlalchemy.org/en/13/core/connections.html#registering-new-dialects).

When called, the `MovR` class constructor creates an instance of the `Engine` class using an input connection string. This `Engine` object represents the connection to the database, and is used by the `sessionmaker()` function to create `Session` objects for each transaction.

### Backend API

The `MovR` class methods function as the "backend API" for the application. [Frontend requests](#routing) get routed to the these methods.

We've already defined the transaction logic in the transaction callback functions, in [`movr/transactions.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/transactions.py). We can now wrap calls to the `run_transaction()` function in the `MovR` class methods.

For example, look at the `start_ride()` method, the method to which frontend requests to start a ride are routed:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/movr/movr.py ||# START start_ride ||# END start_ride %}
~~~

This method takes some keyword arguments, and then returns a `run_transaction()` call. It passes `sessionmaker(bind=self.engine)` as the first argument to `run_transaction()`, which creates a new `Session` object that binds to the `Engine` instance initialized by the `MovR` constructor. It also passes `city`, `rider_id`, `rider_city`, and `vehicle_id`, values passed from the frontend request, as inputs. These are the same keyword arguments, and should be of the same types, as the inputs for the [transaction callback function](#writing) `start_ride_txn()`.

Be sure to review the other functions in [`movr/movr.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/movr.py) before moving on to the next section.

## Web application

The application needs a frontend and a user interface. We use Flask for the web server, routing, and forms. For the web UI, we use some basic, Bootstrapped HTML templates and just a little CSS and JS.

Most of the web application components are found in the `web` and `templates` folders, and in the `server.py` file.

### Configuration

We store the Flask configuration settings in [a `Config` class](https://flask.palletsprojects.com/en/1.1.x/config/#development-production), defined in [`web/config.py`](https://github.com/cockroachlabs/movr-flask/blob/master/web/config.py):

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/web/config.py %}
~~~

This file imports the `os` library, which is used to read from environment variables. When debugging a local deployment, these environment variables are set by the `.env` file that `Pipenv` reads. In a multi-region deployment, the environment variables are set by the `Dockerfile`, and by the [managed cloud deployment service](movr-flask-deployment.html).

The application sets a global Flask configuration variable (`DEBUG`), which it checks to determine whether or not to run against a demo cluster, or a real multi-region deployment.

### Web forms

Forms make up an important part of most web application frontends. We define these in [`web/forms.py`](https://github.com/cockroachlabs/movr-flask/blob/master/web/forms.py), using some data structures from the [`flask_wtf`](https://flask-wtf.readthedocs.io/en/latest/) and [`wtforms`](https://wtforms.readthedocs.io/en/stable/) libraries.

We will not go into much detail about these forms. The important thing to know is that they help handle `POST` requests in the web UI.

The `CredentialForm` class, for example, defines the fields of the login form that users interface with to send a login request to the server:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/web/forms.py ||# START CredentialForm ||# END CredentialForm %}
~~~

Most of the forms defined on this page take the inputs for database reads and writes.

`VehicleForm`, for example, defines the fields of the vehicle registration form. Users enter information about a vehicle they would like to register, and the data is routed to the `add_vehicle()` method defined in [`movr/movr.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/movr.py):

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/web/forms.py ||# START VehicleForm ||# END VehicleForm %}
~~~

### Initialization

[`server.py`](https://github.com/cockroachlabs/movr-flask/blob/master/server.py) defines the main process of the application: the web server. After initializing the database, we run `python server.py` to start up the web server.

Let's look at the first ten lines of `server.py`:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/server.py ||# START front ||# END front %}
~~~

The first line imports standard Flask libraries for connecting, routing, and rendering web pages. The next three lines import some libraries from the Flask ecosystem, for [bootstrapping](https://pythonhosted.org/Flask-Bootstrap/), [authentication](https://flask-login.readthedocs.io/en/latest/), and [security](https://github.com/pallets/werkzeug/blob/master/src/werkzeug/security.py).

The next few lines import other web resources that we've defined separately in our project:

- The [`MovR`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/movr.py#L10) class, which handles the connection and interaction with the running CockroachDB cluster.
- Several [`FlaskForm`](https://flask-wtf.readthedocs.io/en/latest/api.html#flask_wtf.FlaskForm) superclasses, which define the structure of web forms.
- The [`Config`](https://github.com/cockroachlabs/movr-flask/blob/master/web/config.py) class, which holds configuration information for the Flask application.

Finally, we import the `DBAPIError` type from `sqlalchemy`, for error handling.

The next five or so lines initialize the application:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/server.py ||# START init ||# END init %}
~~~

Calling the `Flask()` constructor initializes our Flask web server. By assigning this to a variable (`app`), we can then configure the application, store variables in its attributes, and call it with functions from other libraries, to add features and functionality to the application.

For example, we can bootstrap the application for enhanced HTML and form generation with [`Bootstrap(app)`](https://pythonhosted.org/Flask-Bootstrap/basic-usage.html#basic-usage). We can also add authentication with [`LoginManager(app)`](https://flask-login.readthedocs.io/en/latest/#configuring-your-application), and then control the default routes, based on authentication, with the `DEFAULT_ROUTE_AUTHENTICATED` and `DEFAULT_ROUTE_AUTHENTICATED` constants.

Note that we also define a `protocol` variable that the application later uses to determine its protocol scheme. You should always use HTTPS for secure connections when building an application that accepts user login information.

After initializing the application, we can connect to the database:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/server.py ||# START connect ||# END connect %}
~~~

These two lines connect the application to the database. First the application retrieves the connection string that is stored as a configuration variable of the `app`. Then it calls the `MovR()` constructor to establish a connection to the database at the location we provided to the `Config` object.

### User authentication

User authentication is handled with the [`Flask-Login`](https://flask-login.readthedocs.io/en/latest/) library. This library manages user logins with the [`LoginManager`](https://flask-login.readthedocs.io/en/latest/#flask_login.LoginManager), and some other functions that help verify if a user has been authenticated or not.

To control whether certain routes are accessible to a client session, we define a [`user_loader()` function](https://flask-login.readthedocs.io/en/latest/#flask_login.LoginManager.user_loader):

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/server.py ||# START user_loader ||# END user_loader %}
~~~

To restrict access to a certain page to users that are logged in with the [`LoginManager`](https://flask-login.readthedocs.io/en/latest/#flask_login.LoginManager), we add the `@login_required` decorator function to the route. We'll go over some examples in the [Routing](#routing) section below.

### Routing

We define all Flask routing functions directly in `server.py`.

Flask applications use [`@app.route()` decorators](https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/) to handle client requests to specific URLs. When a request is sent to a URL served by the Flask app instance, the server calls the function defined within the decorator (the routing function).

Flask provides a few useful callbacks to use within a routing function definition:

- [`redirect()`](https://flask.palletsprojects.com/en/1.1.x/api/#flask.redirect), which redirects a request to a different URL.
- [`render_template()`](https://flask.palletsprojects.com/en/1.1.x/api/#flask.render_template), which renders an HTML page, with Jinja2 templating, into a static webpage.
- [`flash()`](https://flask.palletsprojects.com/en/1.1.x/api/#flask.flash), which sends messages from the application output to the webpage.

In addition to calling these functions, and some other standard Flask and Python libraries, the application's routing functions need to call some of the methods that we defined in [`movr/movr.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/movr.py) (the "backend API").

For example, look at the `login()` route:

~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/server.py ||# START login_page ||# END login_page %}
~~~

### Client Location

To optimize for latency in a global application, when a user arrives at the website, their request needs to be routed to the application deployment closest to the location from which they made the request. This step is handled outside of the application logic, by a [cloud-hosted, global load balancer](https://en.wikipedia.org/wiki/Cloud_load_balancing). In our [example multi-region deployment](movr-flask-deployment.html), we use a [GCP external load balancer](https://cloud.google.com/load-balancing/docs/https) that distributes traffic based on the location of the request.

Note that the application uses a `region` variable to keep track of the region in which the application is deployed. This variable is read in from the `REGION` environment variable, which is set during application deployment. The application uses this `region` variable to limit the cities in which a user can look for vehicles to ride to the supported cities in the region.

### User interface

For the example application, we limit the web UI to some static HTML web pages, rendered using Flask's built-in [Jinja-2 engine](https://flask.palletsprojects.com/en/1.1.x/templating/). We will not spend much time covering the web UI. Just note that the forms take input from the user, and that input is usually passed to the backend where it is translated into and executed as a database transaction.

We've also added some Bootstrap syntax and Google Maps, for UX purposes. As you can see, the Google Maps API requires a key. For debugging, you can define this key in the `.env` file. If you decide to use an embedded service like Google Maps in production, you should restrict your Google Maps API key to a specific hostname or IP address from within the cloud provider's console, as the API key could be publicly visible in the HTML. In [Deploying a Multi-Region Web Application](movr-flask-deployment.html), we use GCP secrets to the store the API keys.

## Next Steps

After you finish developing and debugging your application, you can start [deploying the application](movr-flask-deployment.html).

## See also

<!-- [MovR (live demo)](https://movr.cloud)-->
- [SQLAlchemy documentation](https://docs.sqlalchemy.org/en/latest/)
- [Transactions](transactions.html)
- [Flask documentation](https://flask.palletsprojects.com/en/1.1.x/)
- [Build a Python App with CockroachDB and SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html)
