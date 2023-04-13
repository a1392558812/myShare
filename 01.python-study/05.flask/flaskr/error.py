from flask import (Blueprint, flash, g, redirect, render_template, request, url_for)

bp = Blueprint('error', __name__)

def page_not_found(e):
  return render_template('404.html'), 404

def internal_server_error(e):
    # note that we set the 500 status explicitly
    return render_template('500.html'), 500