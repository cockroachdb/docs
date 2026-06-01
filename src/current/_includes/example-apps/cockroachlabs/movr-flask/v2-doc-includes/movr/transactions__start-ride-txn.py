def start_ride_txn(session, city, rider_id, vehicle_id):
    """
    Insert a new row into the rides table and update a row of the vehicles table.

    Arguments:
        session {.Session} -- The active session for the database connection.
        city {String} -- The vehicle's city.
        rider_id {UUID} -- The user's unique ID.
        rider_city {String} -- The city in which the rider is registered.
        vehicle_id {UUID} -- The vehicle's unique ID.
    """
    v = session.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    r = Ride(
        city=city,
        id=str(
            uuid.uuid4()),
        rider_id=rider_id,
        vehicle_id=vehicle_id,
        start_location=v.last_location,
        start_time=datetime.datetime.now(
            datetime.timezone.utc))

    session.add(r)
    v.status = "unavailable"
