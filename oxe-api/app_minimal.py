from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Mock data for demonstration
companies = [
    {"id": 1, "name": "TechCorp", "status": "ACTIVE", "is_startup": True},
    {"id": 2, "name": "CyberSec Ltd", "status": "ACTIVE", "is_startup": False},
]

articles = [
    {"id": 1, "title": "Cybersecurity Trends 2024", "type": "NEWS", "status": "PUBLIC"},
    {"id": 2, "title": "Tech Startup Guide", "type": "RESOURCE", "status": "PUBLIC"},
]

@app.route('/')
def root():
    return jsonify({
        "message": "OpenXeco API is running!",
        "status": "success",
        "environment": os.getenv('ENVIRONMENT', 'unknown'),
        "endpoints": {
            "companies": "/public/get_public_companies",
            "articles": "/public/get_public_articles",
            "health": "/health"
        }
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/public/get_public_companies')
def get_public_companies():
    return jsonify(companies)

@app.route('/public/get_public_articles')
def get_public_articles():
    return jsonify(articles)

@app.route('/public/get_public_settings')
def get_public_settings():
    # Return basic settings that the UI expects
    settings = [
        {"property": "WEBSITE_NAME", "value": "OpenXeco NCC"},
        {"property": "DOMAIN_NAME", "value": "OpenXeco Community"},
        {"property": "PROJECT_DESCRIPTION", "value": "National Cybersecurity Community Platform"},
    ]
    return jsonify(settings)

@app.route('/public/get_public_image/<filename>')
def get_public_image(filename):
    # Return a placeholder for images like favicon
    return '', 404  # For now, return 404 for images

@app.route('/doc')
def documentation():
    return jsonify({
        "title": "OpenXeco API Documentation",
        "version": "1.0.0",
        "description": "Minimal working version of OpenXeco API",
        "endpoints": {
            "GET /": "API information",
            "GET /health": "Health check",
            "GET /public/get_public_companies": "Get all companies",
            "GET /public/get_public_articles": "Get all articles",
            "GET /doc": "This documentation"
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
