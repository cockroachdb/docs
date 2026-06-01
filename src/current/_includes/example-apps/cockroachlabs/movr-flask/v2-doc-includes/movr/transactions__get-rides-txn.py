def get_rides_txn(session, rider_id):
    """
    Select the rows of the rides table for a specific user.

    Arguments:
        session {.Session} -- The active session for the database connection.
        rider_id {UUID} -- The user's unique ID.

    Returns:
        List -- A list of dictionaries containing ride information.
    """
    rides = session.query(Ride).filter(
        Ride.rider_id == rider_id).order_by(Ride.start_time).all()
    return list(map(lambda ride: {'city': ride.city,
                                  'id': ride.id,
                                  'vehicle_id': ride.vehicle_id,
                                  'start_time': ride.start_time,
                                  'end_time': ride.end_time,
                                  'rider_id': ride.rider_id,
                                  'length': ride.length},
                    rides))
