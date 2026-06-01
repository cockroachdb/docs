@login.user_loader
def load_user(user_id):
    return movr.get_user(user_id=user_id)
