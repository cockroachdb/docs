from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime, Boolean, Interval, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.types import DATE
from sqlalchemy.dialects.postgresql import UUID
import datetime
from werkzeug.security import generate_password_hash
from flask_login import UserMixin

Base = declarative_base()
