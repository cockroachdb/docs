class CredentialForm(FlaskForm):
    """Login form class.
    """
    username = StringField('Username: ', validators=[data_required()])
    password = PasswordField('Password: ', validators=[data_required()])
    submit = SubmitField('Sign In')
