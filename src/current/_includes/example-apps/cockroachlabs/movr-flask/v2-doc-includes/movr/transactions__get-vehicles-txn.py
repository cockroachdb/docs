def get_vehicles_txn(session, city):
    """
    Select the rows of the vehicles table for a specific city.

    Arguments:
        session {.Session} -- The active session for the database connection.
        city {String} -- The vehicle's city.

    Returns:
        List -- A list of dictionaries containing vehicle information.
    """
    vehicles = session.query(Vehicle).filter(
        Vehicle.city == city, Vehicle.status != 'removed').all()
    return list(
        map(
            lambda vehicle: {
                'city': vehicle.city,
                'id': vehicle.id,
                'owner_id': vehicle.owner_id,
                'type': vehicle.type,
                'last_location': vehicle.last_location + ', ' + vehicle.city,
                'status': vehicle.status,
                'date_added': vehicle.date_added,
                'color': vehicle.color,
                'brand': vehicle.brand},
            vehicles))
