@app.route('/login', methods=['GET', 'POST'])
def login_page():
    if current_user.is_authenticated:
        return redirect(url_for(DEFAULT_ROUTE_AUTHENTICATED, _external=True, _scheme=protocol))
    else:
        form = CredentialForm()
        if form.validate_on_submit():
            try:
                user = movr.get_user(username=form.username.data)
                if user is None or not check_password_hash(
                        user.password_hash, form.password.data):
                    flash(
                        Markup(
                            'Invalid user credentials.<br>If you aren\'t registered with MovR, go <a href="{0}">Sign Up</a>!'
                        ).format(
                            url_for('register',
                                    _external=True,
                                    _scheme=protocol)))
                    return redirect(
                        url_for('login_page', _external=True,
                                _scheme=protocol))
                login_user(user)
                return redirect(
                    url_for(DEFAULT_ROUTE_AUTHENTICATED, _external=True, _scheme=protocol))
            except Exception as error:
                flash('{0}'.format(error))
                return redirect(
                    url_for('login_page', _external=True, _scheme=protocol))
        return render_template('login.html',
                               title='Log In',
                               form=form,
                               available=session['region'])
