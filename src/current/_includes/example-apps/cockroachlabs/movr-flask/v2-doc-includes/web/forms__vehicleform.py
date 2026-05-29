class VehicleForm(FlaskForm):
    """Vehicle registration form class.
    """
    type = SelectField(label='Type',
                       choices=[('bike', 'Bike'), ('scooter', 'Scooter'),
                                ('skateboard', 'Skateboard')])
    color = StringField(label='Color', validators=[data_required()])
    brand = StringField(label='Brand')
    location = StringField(label='Current location: ',
                           validators=[data_required()])
    submit = SubmitField('Add vehicle')
