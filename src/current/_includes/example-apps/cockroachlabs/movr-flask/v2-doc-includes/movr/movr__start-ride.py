    def start_ride(self, city, rider_id, vehicle_id):
        """
        Wraps a `run_transaction` call that starts a ride.

        Arguments:
            city {String} -- The ride's city.
            rider_id {UUID} -- The user's unique ID.
            vehicle_id {UUID} -- The vehicle's unique ID.
        """
        return run_transaction(
            self.sessionmaker, lambda session: start_ride_txn(
                session, city, rider_id, vehicle_id))
