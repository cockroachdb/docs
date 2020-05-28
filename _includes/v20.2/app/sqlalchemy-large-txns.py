from sqlalchemy import create_engine, Column, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from cockroachdb.sqlalchemy import run_transaction
from random import random

Base = declarative_base()

# The code below assumes you are running as 'root' and have run
# the following SQL statements against an insecure cluster.

# CREATE DATABASE pointstore;

# USE pointstore;

# CREATE TABLE points (
#     id INT PRIMARY KEY DEFAULT unique_rowid(),
#     x FLOAT NOT NULL,
#     y FLOAT NOT NULL,
#     z FLOAT NOT NULL
# );

engine = create_engine(
    'cockroachdb://root@localhost:26257/pointstore',
    connect_args={
        'sslmode': 'disable',
    },
    echo=True
)


class Point(Base):
    __tablename__ = 'points'
    id = Column(Integer, primary_key=True)
    x = Column(Float)
    y = Column(Float)
    z = Column(Float)


def add_points(num_points):
    chunk_size = 1000        # Tune this based on object sizes.

    def add_points_helper(sess, chunk, num_points):
        points = []
        for i in range(chunk, min(chunk + chunk_size, num_points)):
            points.append(
                Point(x=random()*1024, y=random()*1024, z=random()*1024)
            )
        sess.bulk_save_objects(points)

    for chunk in range(0, num_points, chunk_size):
        run_transaction(
            sessionmaker(bind=engine),
            lambda s: add_points_helper(
                s, chunk, min(chunk + chunk_size, num_points)
            )
        )


add_points(10000)
