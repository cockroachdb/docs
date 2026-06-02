class Vehicle(Base):
    """
    Represents rows of the vehicles table.

    Arguments:
        Base {DeclaritiveMeta} -- Base class for declarative SQLAlchemy class definitions that produces appropriate `sqlalchemy.schema.Table` objects.

    Returns:
        Vehicle -- Instance of the Vehicle class.
    """
    __tablename__ = 'vehicles'
    id = Column(UUID, primary_key=True)
    city = Column(String)
    type = Column(String)
    owner_id = Column(UUID, ForeignKey('users.id'))
    date_added = Column(DATE, default=datetime.date.today)
    status = Column(String)
    last_location = Column(String)
    color = Column(String)
    brand = Column(String)

    def __repr__(self):
        return "<Vehicle(city='{0}', id='{1}', type='{2}', status='{3}')>".format(
            self.city, self.id, self.type, self.status)
