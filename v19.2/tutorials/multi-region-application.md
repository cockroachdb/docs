---
title: Developing a Multi-Region Web Application
summary: This page includes instructions for building a multi-region web application on CockroachDB, using Flask and SQLAlchemy.
toc: true
---

After you [set up the database and development environment](multi-region-setup.html), you are ready to look at the example application source code.

## Project structure

Our application needs to handle requests from clients, namely web browsers. To translate these kinds of requests into database transactions, the application stack consists of the following components:

- A geo-partitioned database schema that defines the tables and indexes for user, vehicle, and ride data. For details, see [Creating a Multi-Region Database Schema](multi-region-database.html).
- A multi-node, geo-distributed CockroachDB cluster, with each node's locality corresponding to cloud provider regions. For instructions on setting up a virtual cluster, see [Setting Up a Virtual Environment for Developing Multi-Region Applications](multi-region-setup.html). For instructions on setting up a multi-region cluster, see [Deploying a Multi-Region Web Application](multi-region-deployment.html).
- Python class definitions that map to the tables in our database. For details, see [Declaring mappings](multi-region-application.html#declaring-mappings).
- Functions that wrap database transactions. For details, see [Defining transactions](multi-region-application.html#defining-transactions).
- A backend API that defines the application's connection to the database. For details, see [Connecting to the database](multi-region-application.html#connecting-to-the-database).
- A [Flask](https://palletsprojects.com/p/flask/) server that handles requests from client mobile applications and web browsers. For details, see [Building the web application](multi-region-application.html#building-the-web-application).
- HTML files that the Flask server can render into web pages. For details, see [Creating a Web UI](multi-region-application.html#creating-a-web-ui).

Here is the application's project directory structure:

~~~ shell
movr
├── Dockerfile  ## Defines the Docker container build
├── LICENSE  ## A license file for your application
├── Pipfile ## Lists PyPi dependencies for pipenv
├── Pipfile.lock
├── README.md  ## Contains instructions on running the application
├── __init__.py
├── dbinit.sql  ## Initializes the database, and partitions the tables by region
├── mcingress.yaml ## Defines the multi-cluster ingress K8s object, for multi-region deployment
├── movr
│   ├── __init__.py
│   ├── models.py  ## Defines classes that map to tables in the movr database
│   ├── movr.py  ## Defines the primary backend API
│   └── transactions.py ## Defines transaction callback functions
├── movr.yaml  ## Defines service and deployment K8s objects for multi-region deployment
├── requirements.txt  ## Lists PyPi dependencies for Docker container
├── server.py  ## Defines a Flask web application to handle requests from clients and render HTML files
├── static  ## Static resources for the web frontend
│   ├── movr-lockup.png
│   └── movr-symbol.png
├── templates  ## HTML templates for the web UI
│   ├── _nav.html
│   ├── home.html
│   ├── layout.html
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
    ├── geoutils.py  ## Defines utility functions for the web application
    └── gunicorn.py  ## Contains gunicorn configuration settings
~~~

In the sections that follow, we go over each of the files and folders in the project, with a focus on the backend and database components.

## Using SQLAlchemy with CockroachDB

Object Relational Mappers (ORM's) map classes to tables, class instances to rows, and class methods to transactions on the rows of a table. The `sqlalchemy` package includes some base classes and methods that you can use to connect to your database's server from a Python application, and then map tables in that database to Python classes.

In our example, we use SQLAlchemy's [Declarative](https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/) extension, which is built on the `mapper()` and `Table` data structures. We also use the [`cockroachdb`](https://github.com/cockroachdb/cockroachdb-python) Python package, which includes some functions that help you handle [transactions](../transactions.html) in a running CockroachDB cluster.

### Declaring mappings

By now, you should be familiar with the `movr` database and each of the tables in the database (`users`, `vehicles`, and `rides`).

Open [`movr/models.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/models.py), and look at the first 10 lines of the file:

~~~ python
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Index, String, DateTime, Integer, Boolean, Float, Interval, ForeignKey, CheckConstraint, PrimaryKeyConstraint
from sqlalchemy.types import DECIMAL, DATE
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

Base = declarative_base()
~~~

The first data structure that the file imports is `declarative_base`, a constructor for the [declarative base class](https://docs.sqlalchemy.org/en/13/orm/extensions/declarative/api.html#sqlalchemy.ext.declarative.declarative_base), built on SQLAlchemy's Declarative extension. All mapped objects inherit from this object. We assign a declarative base object to the `Base` variable right below the imports.

The `models.py` file also imports some other standard SQLAlchemy data structures that represent database objects (like columns and indexes), data types, and constraints, in addition to a standard Python library to help with default values (i.e. `datetime`).

Since the application handles user logins and authentication, we also need to import some security libraries from the Flask ecosystem. We'll cover the web development libraries in more detail in [Building the web application](multi-region-application.html#building-the-web-application).

#### The `User` class

Recall that each instance of a table class represents a row in the table, so we name our table classes as if they were individual rows of their parent table, since that's what they'll represent when we construct class objects.

Take a look at the `User` class definition:

~~~ python
class User(Base):
    __tablename__ = 'users'
    id = Column(UUID)
    city = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    username = Column(String, unique=True)
    password_hash = Column(String)
    is_owner = Column(Boolean)
    PrimaryKeyConstraint(city, id)

    def __repr__(self):
        return "<User(city='%s', id='%s', name='%s')>" % (self.city, self.id, self.first_name + ' ' + self.last_name)
~~~

The `User` class has the following attributes:

- `__tablename__`, which holds the stored name of the table in the database. SQLAlchemy requires this attribute for all classes that map to tables.
- All of the other attributes of the `User` class (`id`, `city`, `first_name`, etc.), stored as `Column` objects. These attributes represent columns of the `users` table. The constructor for each `Column` takes the column data type as its first argument, and then any additional arguments. To help define column objects, SQLAlchemy also includes classes for SQL data types and column constraints. For the columns in this table, we just use `UUID` and `String` data types.
- `PrimaryKeyConstraint()`, which defines a composite primary key with the `city` and `id` columns. Note that the partitioned column (`city`) precedes the `id` column, per [partition querying best practices](../partitioning.html#filtering-on-an-indexed-column).
- The `__repr__` function, which defines the string representation of the object.

#### The `Vehicle` class

Next, look at the `Vehicle` class definition:

~~~ python
class Vehicle(Base):
    __tablename__ = 'vehicles'
    id = Column(UUID)
    city = Column(String)
    type = Column(String)
    owner_id = Column(UUID, ForeignKey('users.id'))
    date_added = Column(DATE, default=datetime.date.today)
    status = Column(String)
    last_location = Column(String)
    color = Column(String)
    brand = Column(String)
    PrimaryKeyConstraint(city, id)

    def __repr__(self):
        return "<Vehicle(city='%s', id='%s', type='%s', status='%s')>" % (self.city, self.id, self.type, self.status)
~~~

Recall that the `vehicles` table contains more columns and data types than the `users` table. It also contains a [foreign key constraint](../foreign-key.html) (on the `users` table), and a default value. These differences are reflected in the `Vehicle` class.

#### The `Ride` class

Lastly, there's the `Ride` class:

~~~ python
class Ride(Base):
    __tablename__ = 'rides'
    id = Column(UUID)
    city = Column(String, ForeignKey('vehicles.city'))
    rider_id = Column(UUID, ForeignKey('users.id'))
    rider_city = Column(String, ForeignKey('users.city'))
    vehicle_id = Column(UUID, ForeignKey('vehicles.id'))
    start_location = Column(String)
    end_location = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    length = Column(Interval)
    PrimaryKeyConstraint(city, id)

    def __repr__(self):
        return "<Ride(city='%s', id='%s', rider_id='%s', vehicle_id='%s')>" % (self.city, self.id, self.rider_id, self.vehicle_id)
~~~

The `rides` table has four foreign key constraints, two on the `users` table and two on the `vehicles` table.

### Defining transactions

After you create a class for each table in the database, you can start defining functions that bundle together common SQL operations as atomic [transactions](../transactions.html).

#### Using the `cockroachdb` Python library

The [`cockroachdb`](https://github.com/cockroachdb/cockroachdb-python/tree/master/cockroachdb) Python library handles transactions in SQLAlchemy with the `run_transaction()` function. This function takes a `transactor`, which can be an [`Engine`](https://docs.sqlalchemy.org/en/13/core/connections.html#sqlalchemy.engine.Engine), [`Connection`](https://docs.sqlalchemy.org/en/13/core/connections.html#sqlalchemy.engine.Connection), or [`sessionmaker`](https://docs.sqlalchemy.org/en/13/orm/session_api.html#sqlalchemy.orm.session.sessionmaker) object, and a callback function. It then uses the `transactor` to connect to the database, and executes the callback as a database transaction.

`run_transaction()` abstracts the details of [transaction retries](../transactions.html#transaction-retries) away from your application code. Transaction retries are more frequent in CockroachDB than in some other databases because CockroachDB uses [optimistic concurrency control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) rather than locking. As a result, a CockroachDB transaction may have to be tried more than once before it can commit. This is part of how we ensure that our transaction ordering guarantees meet the ANSI [SERIALIZABLE](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Serializable) isolation level.

`run_transaction()` has the following additional benefits:

- When passed a [sqlalchemy.orm.session.sessionmaker](https://docs.sqlalchemy.org/en/latest/orm/session_api.html#session-and-sessionmaker) object (*not* a `session`), it ensures that a new session is created exclusively for use by the callback, which protects you from accidentally reusing objects via any sessions created outside the transaction.
- It abstracts away the [client-side transaction retry logic](../transactions.html#client-side-intervention) from your application, which keeps your application code portable across different databases.
- It will run your transactions to completion much faster than a naive implementation that created a fresh transaction after every retry error. Because of the way the CockroachDB dialect's driver structures the transaction attempts (using a [`SAVEPOINT`](../savepoint.html) statement under the hood, which has a slightly different meaning in CockroachDB than in some other databases), the server is able to preserve some information about the previously attempted transactions to allow subsequent retries to complete more easily.

 Because all callback functions are passed to `run_transaction()`, the `Session` method calls within those callback functions are written a little differently than the typical SQLAlchemy application. Most importantly, those functions must not change the session and/or transaction state. This is in line with the recommendations of the [SQLAlchemy FAQs](https://docs.sqlalchemy.org/en/latest/orm/session_basics.html#session-frequently-asked-questions), which state (with emphasis added by the original author) that

 > As a general rule, the application should manage the lifecycle of the session *externally* to functions that deal with specific data. This is a fundamental separation of concerns which keeps data-specific operations agnostic of the context in which they access and manipulate that data.

 and

 > Keep the lifecycle of the session (and usually the transaction) **separate and external**.

 In keeping with the above recommendations from the official docs, we strongly recommend avoiding any explicit mutations of the transaction state inside the callback passed to `run_transaction()`, since that will lead to breakage. Specifically, we do not make calls to the following functions from inside `run_transaction()`:

 - [`sqlalchemy.orm.Session.commit()`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html?highlight=commit#sqlalchemy.orm.session.Session.commit) (or other variants of `commit()`): This is not necessary because `run_transaction()` handles the savepoint/commit logic for you.
 - [`sqlalchemy.orm.Session.rollback()`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html?highlight=rollback#sqlalchemy.orm.session.Session.rollback) (or other variants of `rollback()`): This is not necessary because `run_transaction()` handles the commit/rollback logic for you.
 - `Session.flush()`: This will not work as expected with CockroachDB because CockroachDB does not support nested transactions, which are necessary for `Session.flush()` to work properly. If the call to `Session.flush()` encounters an error and aborts, it will try to rollback. This will not be allowed by the currently-executing CockroachDB transaction created by `run_transaction()`, and will result in an error message like the following: `sqlalchemy.orm.exc.DetachedInstanceError: Instance <FooModel at 0x12345678> is not bound to a Session; attribute refresh operation cannot proceed (Background on this error at: http://sqlalche.me/e/bhk3)`.

 In the example application provided, all calls to `run_transaction()` are found within the methods of the `MovR` class (defined in [`movr/movr.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/movr.py)), which represents the connection to the running database. Requests to the web application frontend (defined in [`server.py`](https://github.com/cockroachlabs/movr-flask/blob/master/server.py)), are routed to the `MovR` class methods.

#### Defining transaction callback functions

 To separate concerns, we define all callback functions passed to `run_transaction()` calls in a separate file, [`movr/transactions.py`](https://github.com/cockroachlabs/movr-flask/blob/master/movr/transactions.py). These callback functions wrap `Session` method calls, like [`session.query()`](https://docs.sqlalchemy.org/en/13/orm/session_api.html#sqlalchemy.orm.session.Session.query) and [`session.add()`](https://docs.sqlalchemy.org/en/13/orm/session_api.html#sqlalchemy.orm.session.Session.add), to perform database operations within a transaction.

{{site.data.alerts.callout_success}}
We recommend that you pass a `sessionmaker` object, bound to an existing `Engine`, to `run_transaction()`, as we do in the MovR example application. Every time `run_transaction()` is called, it uses the `sessionmaker` object to create a new [`Session`](https://docs.sqlalchemy.org/en/13/orm/session.html) object.
{{site.data.alerts.end}}

`transactions.py` imports all of the table classes that we defined in `models.py`, in addition to some SQLAlchemy and standard Python data structures needed to generate correctly-typed row values that the ORM can write to the database.

~~~ python
from movr.models import Vehicle, Ride, User
from sqlalchemy import cast, Numeric
import datetime
import uuid
~~~

##### Reading

A common query that a client might want to run is a read of the `rides` table. The transaction callback function for this query is defined here as `get_rides_txn()`:

~~~ python
def get_rides_txn(session, rider_id):
    rides = session.query(Ride).filter(
        Ride.rider_id == rider_id).order_by(Ride.start_time).all()
    return list(map(lambda ride: {'city': ride.city, 'id': ride.id, 'vehicle_id': ride.vehicle_id, 'start_time': ride.start_time, 'end_time': ride.end_time, 'rider_id': ride.rider_id, 'length': ride.length}, rides))
~~~

The `get_rides_txn()` function takes a `Session` object and a `rider_id` string as its inputs, and it outputs a list of dictionaries containing the columns-value pairs of a row in the `rides` table. To retrieve the data from the database bound to a particular `Session` object, we use `Session.query()`, a method of the `Session` class. This method returns a `Query` object, with methods for filtering and ordering query results.

Note that the `get_rides_txn()` function returns the rides for a specific rider, which can be in more than one city. The function does not filter the query by `city`, and therefore does not limit the query to ride data stored in a particular region.

Another common query would be to read the registered vehicles in a particular city, to see which vehicles are available for riding. Unlike `get_rides_txn()`, the `get_vehicles_txn()` function takes the `city` string as an input.

~~~ python
def get_vehicles_txn(session, city):
    vehicles = session.query(Vehicle).filter(
        Vehicle.city == city, Vehicle.status != 'removed').all()
    return list(map(lambda vehicle: {'city': vehicle.city, 'id': vehicle.id, 'owner_id': vehicle.owner_id, 'type': vehicle.type, 'last_location': vehicle.last_location + ', ' + vehicle.city, 'status': vehicle.status, 'date_added': vehicle.date_added, 'color': vehicle.color, 'brand': vehicle.brand}, vehicles))
~~~

This function filters the query on the `city` column. Because the data in the vehicles table is partitioned by `city`, the function only queries a specific partition of data, constrained to a particular region.

##### Writing

There are two basic types of write operations: creating new rows and updating existing rows. In SQL terminology, these are [`INSERT`](../insert.html)/[`UPSERT`](../insert.html) statements and [`UPDATE`](../update.html) statements.  All transaction callback functions that update existing rows include a `session.query()` call. All functions adding new rows call `session.add()`. Some functions do both.

For example, `start_ride_txn()`, which is called when a user starts a ride, adds a new row to the `rides` table, and then updates a row in the `vehicles` table.

~~~ python
def start_ride_txn(session, city, rider_id, rider_city, vehicle_id):
    v = session.query(Vehicle).filter(Vehicle.city == city,
                                      Vehicle.id == vehicle_id).first()
    r = Ride(city=city, id=str(uuid.uuid4()), rider_id=rider_id,
             rider_city=rider_city, vehicle_id=vehicle_id, start_location=v.last_location, start_time=datetime.datetime.now(datetime.timezone.utc))
    session.add(r)
    v.status = "unavailable"
~~~

The function takes the `city` string, `rider_id` UUID, `rider_city` string, and `vehicle_id` UUID as inputs. It queries the `vehicles` table for all vehicles of a specific ID, and in a specific city. It also creates a `Ride` object, representing a row of the `rides` table. To add the ride to the table in the database bound to the `Session`, the function calls `Session.add()`. To update a row in the `vehicles` table, it just modifies the object attribute. `start_ride_txn()` is called by `run_transaction()`, which commits the transaction to the database.

Be sure to review the other callback functions in `transactions.py` before moving on to the next section.

Now that we've covered the table classes and some transaction functions, we can look at the interface that connects web requests to a running CockroachDB cluster.

### Connecting to the database

The `MovR` class, defined in `movr/movr.py`, handles connections to CockroachDB using SQLAlchemy's [`Engine`](https://docs.sqlalchemy.org/en/13/core/connections.html#sqlalchemy.engine.Engine) class.

Let's start with the beginning of the file:

~~~ python
from movr.transactions import start_ride_txn, end_ride_txn, add_user_txn, add_vehicle_txn, get_users_txn, get_user_txn, get_vehicles_txn, get_rides_txn, remove_user_txn, remove_vehicle_txn
from cockroachdb.sqlalchemy import run_transaction
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects import registry
registry.register(
    "cockroachdb", "cockroachdb.sqlalchemy.dialect", "CockroachDBDialect")


class MovR:
    def __init__(self, conn_string):
        self.engine = create_engine(conn_string, convert_unicode=True)
~~~

`movr.py` first imports the transaction callback functions that we defined in the `transactions.py` file. It then imports the `run_transaction()` function from the `cockroachdb` Python library. The `MovR` class methods call `run_transaction()` to execute the transaction callback functions as transactions.

The file also imports some `sqlalchemy` libraries to create instances of the `Engine` and `Session` classes, and to [register the CockroachDB as a dialect](https://docs.sqlalchemy.org/en/13/core/connections.html#registering-new-dialects).

When called, the `MovR` class constructor creates an instance of the `Engine` class using an input connection string. This `Engine` object represents the connection to the database, and is used by the `sessionmaker()` function to create `Session` objects for each transaction.

### Creating a backend API

The `MovR` class methods function as the "backend API" for the application. [Frontend requests](multi-region-application.html#routing) get routed to the these methods.

We've already defined the transaction logic in the transaction callback functions, in `transactions.py`. We can now wrap calls to the `run_transaction()` function in the `MovR` class methods.

For example, look at the `start_ride()` function:

~~~ python
def start_ride(self, city, rider_id, rider_city, vehicle_id):
        return run_transaction(sessionmaker(bind=self.engine), lambda session: start_ride_txn(session, city, rider_id, rider_city, vehicle_id))
~~~

The function takes some keyword arguments, and then returns the `run_transaction()` call, using a new session and the callback function `start_ride_txn()`. `start_ride()` passes `sessionmaker(bind=self.engine)` as the first argument in `run_transaction()`, creating a new `Session` object that binds to the `Engine` instance initialized by the `MovR` constructor.

The function also takes `city`, `rider_id`, `rider_city`, and `vehicle_id` as inputs. These are the same keyword arguments, and should be of the same types, as the inputs for `start_ride_txn()`.

Be sure to review the other functions in `movr.py` before moving on to the next section.

## Building the web application

By now you should have an idea of what components we need to connect to a running database, map our database objects to objects in Python, and then interact with the database transactionally. All the application needs now is a front end. We use Flask for the web server, routing, and forms. For the web UI, we use some basic, Bootstrapped HTML templates.

Most of the web application components are found in the `web` and `templates` folders, and in the `server.py` file.

### Configuring the server's environment

We store the Flask configuration settings in the `Config` class, defined in [`web/config.py`](https://github.com/cockroachlabs/movr-flask/blob/master/web/config.py):

~~~ python
import os


class Config:
    DEBUG = os.environ['DEBUG']
    SECRET_KEY = os.environ['SECRET_KEY']
    API_KEY = os.environ['API_KEY']
    DB_URI = os.environ['DB_URI']
    PREFERRED_URL_SCHEME = ('https', 'http')[DEBUG == 'True']
~~~

This file imports the `os` library, which is used to read from environment variables. When debugging a local deployment, these environment variables are set by the `.env` file that `Pipenv` reads. In a multi-region deployment, the environment variables are set by the `Dockerfile`, and by some commands issued during [the Kubernetes deployment](multi-region-deployment.html#multi-region-application-deployment-gke).

Rather than rewrite lines of code when we want to debug certain functionality in the application, the application sets a global Flask configuration variable (`DEBUG`), and then uses the variable in the application's control flow to determine whether or not to run against a virtual cluster, or a real multi-region deployment.

### Creating the web forms

Forms make up an important part of most web application front ends. We define these in [`web/forms.py`](https://github.com/cockroachlabs/movr-flask/blob/master/web/forms.py), using some data structures from the [`flask_wtf`](https://flask-wtf.readthedocs.io/en/stable/) and [`wtforms`](https://wtforms.readthedocs.io/en/stable/) libraries.

We won't go into much detail about these forms in this guide. The important thing to know is that they help handle `POST` requests in the web UI.

The `CredentialForm` class, for example, defines the fields of the login form that users interface with to send a login request to the server:

~~~ python
class CredentialForm(FlaskForm):
    username = StringField('Username: ', validators=[data_required()])
    password = PasswordField('Password: ', validators=[data_required()])
    submit = SubmitField('Sign In')
~~~

Most of the forms defined on this page take the inputs for database reads and writes.

`VehicleForm`, for example, defines the fields of the vehicle registration form. Users enter information about a vehicle they would like to register, and the data is routed to the `add_vehicle()` method defined in `movr/movr.py`:

~~~ python
class VehicleForm(FlaskForm):
    type = SelectField(label='Type', choices=[
                       ('bike', 'Bike'), ('scooter', 'Scooter'), ('skateboard', 'Skateboard')])
    color = StringField(label='Color', validators=[data_required()])
    brand = StringField(label='Brand')
    location = StringField(label='Current location: ',
                           validators=[data_required()])
    submit = SubmitField('Add vehicle')

~~~

### Initializing the application

[`server.py`](https://github.com/cockroachlabs/movr-flask/blob/master/server.py) defines the main process of the application: the web server. After initializing the database, we run `python server.py` to start up the web server.

Let's look at the first ten lines of `server.py`:

~~~ python
from flask import Flask, __version__, render_template, session, redirect, flash, url_for, Markup, request
from flask_bootstrap import Bootstrap
from flask_login import LoginManager, current_user, login_user, logout_user, login_required
from werkzeug.security import check_password_hash
from movr.movr import MovR
from web.forms import CredentialForm, RegisterForm, VehicleForm, StartRideForm, EndRideForm, RemoveUserForm, RemoveVehicleForm
from web.config import Config
from web.geoutils import get_region
from sqlalchemy.exc import DBAPIError
~~~

The first line imports standard Flask libraries for connecting, routing, and rendering web pages. The next three lines import some libraries from the Flask ecosystem, for [bootstrapping](https://pythonhosted.org/Flask-Bootstrap/), [authentication](https://flask-login.readthedocs.io/en/latest/), and [security](https://github.com/pallets/werkzeug/blob/master/src/werkzeug/security.py).

The next four lines import other web resources that we've defined separately in our project:

- The `MovR` class, which handles the connection and interaction with the running CockroachDB cluster.
- Several `FlaskForm` superclasses, which define the structure of web forms.
- The `Config` class, which holds configuration information for the Flask application.
- `get_region()`, which matches a city to a cloud provider region, so the application knows which partition to query.

Finally, we import the `DBAPIError` type from `sqlalchemy`, for error handling.

The next five or so lines initialize the application:

~~~ python
app = Flask(__name__)
app.config.from_object(Config)
Bootstrap(app)
login = LoginManager(app)
protocol = ('https', 'http')[app.config.get('DEBUG') == 'True']
~~~

Calling the `Flask()` constructor initializes a WSGI application (our Flask web server). By assigning this to a variable (`app`), we can then configure the application, store variables in its attributes, and call it with functions from other libraries, to add features and functionality to the application.

For example, we can bootstrap the application for enhanced HTML and form generation with `Bootstrap(app)`. We can also add authentication with `LoginManager(app)`.

After initializing the WSGI application, we can connect to the database:

~~~ python
conn_string = app.config.get('DB_URI')
movr = MovR(conn_string)
~~~

Here, the application retrieves the connection string that is stored as a configuration variable of the `app`, and then calls the `MovR()` constructor to establish a connection to the database at the location we provided to the `Config` object.


### User authentication

User authentication is handled with the [`Flask-Login`](https://flask-login.readthedocs.io/en/latest/) library. This library manages user logins with the [`LoginManager`](https://flask-login.readthedocs.io/en/latest/#flask_login.LoginManager), and some other functions that help verify if a user has been authenticated or not.

To control whether certain routes are accessible to a client session, we define a `user_loader()` function:

~~~ python
# Define user_loader function for LoginManager
@login.user_loader
def load_user(user_id):
    return movr.get_user(user_id=user_id)
~~~

To restrict access to a certain page to users that are logged in with the `LoginManager`, we add the `@login_required` decorator function to the route. We'll go over some examples in the [Routing](multi-region-application.html#routing) section below.

### Routing

We define all Flask routing functions directly in `server.py`.

Flask applications use [`@app.route()` decorators](https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/) to handle client requests to specific URL's. When a request is sent to a URL served by the Flask app instance, the server calls the function defined within the decorator (the routing function).

Flask provides a few useful callbacks to use within a routing function definition:
- `redirect()`, which redirects a request to a different URL.
- `render_template()`, which renders an HTML page, with Jinja2 templating, into a static webpage.
- `flash()`, which sends messages from the application output to the webpage.

In addition to calling these functions, and some other standard Flask and Python libraries, the application's routing functions need to call some of the methods that we defined in `movr.py` (the "backend API").

For example, look, at the `login()` route:

~~~ python
# Login page
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home_page', _external=True, _scheme=protocol))
    else:
        form = CredentialForm()
        if form.validate_on_submit():
            try:
                user = movr.get_user(username=form.username.data)
                if user is None or not check_password_hash(user.password_hash, form.password.data):
                    flash(Markup('Invalid user credentials.<br>If you aren\'t registered with MovR, go <a href="{0}">Sign Up</a>!').format(
                        url_for('register', _external=True, _scheme=protocol)))
                    return redirect(url_for('login', _external=True, _scheme=protocol))
                login_user(user)
                return redirect(url_for('home_page', _external=True, _scheme=protocol))
            except Exception as error:
                flash('{0}'.format(error))
                return redirect(url_for('login', _external=True, _scheme=protocol))
        return render_template('login.html', title='Log In', form=form, available=session['region'])
~~~

### Client Location

In an earlier section ([Latency in global applications](multi-region-use-case.html#latency-in-global-applications)), we discussed the importance of reducing application latency by making our application location-aware.

To optimize for latency in a global application, when a user arrives at the website, their request needs to be routed to the application deployment closest to the location from which they made the request. This step is handled outside of the application logic, by a [cloud-hosted, global load balancer](https://en.wikipedia.org/wiki/Cloud_load_balancing). In our [example multi-region deployment](multi-region-deployment.html#multi-region-application-deployment-gke), we use a [GCP multi-cluster ingress](https://cloud.google.com/kubernetes-engine/docs/how-to/multi-cluster-ingress).

For the purposes of this section of the guide, let's assume that the application has been deployed behind a global load balancer that routes requests to deployments, based on the location of the request. Even if the application request is routed to the correct regional deployment of the application, the application still needs to know where the client located, so that requests can be translated into database operations on the partitions relevant to the client's location (city, in this case). For example, if a user logs onto your website in New York, you want them to only see the vehicles available in New York, and you want to them to only be able to start rides in New York.

All HTTP requests include standard HTTP headers. Client location information is not included in [standard HTTP header fields](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields), but some non-standard HTTP header fields include information that can be used to derive client location, using client-side logic. For example, you can reverse geo-locate an IP address delivered through the [`X-Forwarded-For`](https://en.wikipedia.org/wiki/X-Forwarded-For) field.

Most load-balancing services require you to enable header forwarding, or the original request headers will be lost behind the load balancer. Some services, like GCP Network Services, allow you to define non-standard HTTP headers to include location information directly with [user-defined request headers](https://cloud.google.com/load-balancing/docs/user-defined-request-headers), helping you avoid writing client-side logic for reverse geo-location.

We discuss the details of configuring custom request header fields in our [example production deployment](multi-region-deployment.html#multi-region-application-deployment-gke). For now, let's assume that you receive the location of your client from a request header field named "`X-City`".

Suppose that a user is coming to the website for the first time. They type in the address of the website, let's say `https://movr.cloud`, into their browser, and hit enter. The following example routing function gathers the client's location, stores it in a persistent Flask `session` variable, and then renders the home page:

~~~ python
@app.route('/', methods=['GET'])
@app.route('/home', methods=['GET'])
def home_page():
    if app.config.get('DEBUG') == 'True':
        session['city'] = 'new york'
    else:
        try:
            session['city'] = request.headers.get("X-City").lower()
            # This header attribute is passed by the HTTP load balancer, to its configured backend. The header must be configured manually in the cloud service provider's console to include this attribute. See README for more details.
        except Exception as error:
            session['city'] = 'new york'
            flash('{0} {1}'.format(
                error, '\nUnable to retrieve client city information.\n Application is now assuming you are in New York.'))
    session['region'] = get_region(session['city'])
    session['riding'] = None
    return render_template('home.html', available=session['region'], city=session['city'])
~~~

Perhaps the first thing that you'll notice is that the function's control flow sequence evaluates the `DEBUG` configuration variable first. If the application is in `DEBUG` mode, it greatly simplifies the work that the application needs to do with the request information by just setting the city to `new york`. This variable should be set to `True` if you are running the application against [a virtual CockroachDB cluster](multi-region-setup.html#setting-up-a-virtual-multi-region-cockroachdb-cluster).

Suppose that we are *not* in `DEBUG` mode. The request defines a new session variable, `city`, as the value in the request header field `X-City`. If the process fails for some reason (e.g., the `X-City` header field wasn't properly forwarded), the application sets `city` to `new york`, like the `DEBUG` case, and prints the error to the rendered webpage, using Flask's `flash()` function.

In all cases, the session variables `city`, `region`, and `riding` are initialized, and then the `home.html` web page is rendered, with the `region` and `city` variables passed to the HTML template as variables.

### Creating a Web UI

For the example application, we limit the web UI to some static HTML web pages, rendered using Flask's built-in [Jinja-2 engine](https://flask.palletsprojects.com/en/1.1.x/templating/). We won't spend much time covering the web UI. Just note that the forms take input from the user, and that input is usually passed to the backend where it is translated into and executed as a database transaction.

We've also added some Bootstrap syntax and Google Maps, for UX purposes. As you can see, the Google Maps API requires a key. For debugging, you can define this key in the `.env` file. If you decide to use an embedded service like Google Maps in production, you should restrict your Google Maps API key to a specific hostname or IP address from within the cloud provider's console, as the API key will be publicly visible in the HTML. In [Deploying a Multi-Region Web Application](multi-region-deployment.html), we use Kubernetes secrets to the store the API keys.

## Next Steps

After you finish developing and debugging your application, you can start [deploying the application](multi-region-deployment.html).

## See also

- [SQLAlchemy documentation](https://docs.sqlalchemy.org/en/latest/)
- [Transactions](../transactions.html)
- [Flask documentation](https://flask.palletsprojects.com/en/1.1.x/)
