from flask import Flask

app = Flask(__name__)

from app import routes  # Import routes after creating the app instance to avoid circular imports