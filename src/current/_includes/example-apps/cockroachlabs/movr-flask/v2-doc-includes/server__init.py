DEFAULT_ROUTE_AUTHENTICATED = "vehicles"
DEFAULT_ROUTE_NOT_AUTHENTICATED = "login_page"

# Initialize the app
app = Flask(__name__)
app.config.from_object(Config)
Bootstrap(app)
login = LoginManager(app)
protocol = ('https', 'http')[app.config.get('DEBUG') == 'True']
