import sys
import os

# Add parent directory to path so model and main can be imported in Vercel serverless environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# Vercel looks for the ASGI application handler
app = app
