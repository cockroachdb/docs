class User(Base, UserMixin):
    """
    Represents rows of the users table.

    Arguments:
        Base {DeclaritiveMeta} -- Base class for declarative SQLAlchemy class definitions that produces appropriate `sqlalchemy.schema.Table` objects.
        UserMixin {UserMixin} -- Mixin object that provides default implementations for the methods that Flask-Login expects user objects to have.

    Returns:
        User -- Instance of the User class.
    """
    __tablename__ = 'users'
    id = Column(UUID, primary_key=True)
    city = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    username = Column(String, unique=True)
    password_hash = Column(String)
    is_owner = Column(Boolean)

    def set_password(self, password):
        """
        Hash the password set by the user at registration.
        """
        self.password_hash = generate_password_hash(password)

    def __repr__(self):
        return "<User(city='{0}', id='{1}', name='{2}')>".format(
            self.city, self.id, self.first_name + ' ' + self.last_name)
