from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
# Configure CORS to allow requests from the web UI
CORS(app, origins=["https://openxeco-web.onrender.com", "https://openxeco-web.vercel.app", "http://localhost:3001", "http://localhost:3000"], 
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

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
            "POST /account/create_account": "Create test account",
            "GET /doc": "This documentation"
        }
    })

@app.route('/account/create_account', methods=['POST'])
def create_test_account():
    # For demo purposes, create a mock successful response
    return jsonify({
        "success": True,
        "message": "Account created successfully",
        "email": "test@example.com",
        "note": "Use admin@openxeco.local / Admin123! for immediate access"
    })

@app.route('/account/login', methods=['POST'])
def login():
    # Mock login - for demo, we simulate requesting OTP
    data = request.get_json() if request.is_json else {}
    email = data.get('email', '')
    
    if email:
        # Return success to trigger OTP flow in frontend
        return jsonify({
            "message": "OTP sent to email",
            "email": email,
            "require_otp": True
        })
    else:
        return jsonify({"error": "Email required"}), 400

@app.route('/account/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Logged out successfully"})


@app.route('/account/verify_otp', methods=['POST'])
def verify_otp():
    # Mock OTP verification - always succeeds for demo
    return jsonify({
        "access_token": "demo-token-verified-123",
        "refresh_token": "demo-refresh-verified-456",
        "user": {
            "email": "admin@openxeco.local",
            "status": "ACCEPTED", 
            "is_admin": True
        }
    })

@app.route('/account/verify_login', methods=['POST'])
def verify_login_otp():
    # Mock OTP verification for login - always succeeds for demo
    # This is what the frontend actually calls
    return jsonify({
        "access_token": "demo-token-login-verified-123",
        "refresh_token": "demo-refresh-login-verified-456",
        "user": {
            "email": "admin@openxeco.local",
            "status": "ACCEPTED", 
            "is_admin": True
        }
    })

@app.route('/account/request_otp', methods=['POST'])
def request_otp():
    # Mock OTP request - always succeeds
    return jsonify({
        "message": "OTP sent successfully",
        "otp_code": "123456"  # For demo purposes, show the OTP
    })

@app.route('/private/get_my_user', methods=['GET'])
def get_my_user():
    # Mock user info - for demo purposes
    return jsonify({
        "email": "admin@openxeco.local",
        "status": "ACCEPTED",
        "is_admin": True,
        "first_name": "Admin",
        "last_name": "User"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
