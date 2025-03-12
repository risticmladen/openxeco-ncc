from config.config import ENVIRONMENT, CORS_DOMAINS

def set_cookie(request, response, name, value, expires=24 * 60 * 60):
    if ENVIRONMENT == "dev":
        # Development environment
        response.set_cookie(
            name,
            value=value,
            path="/",
            domain=None,  # Domain is None for local testing
            secure=True,  # Ensure cookie is only sent over HTTPS
            httponly=True,
            expires=expires,
            samesite="None"  # Allow cookie in cross-site contexts
        )
    else:
        # Production environment
        origin = request.environ.get('HTTP_ORIGIN')
        if origin:
            domains = [d for d in CORS_DOMAINS.split(",") if d in origin]

            for d in domains:
                response.set_cookie(
                    name,
                    value=value,
                    path="/",
                    domain=d,  # Use the domain from CORS_DOMAINS
                    secure=True,  # Ensure cookie is only sent over HTTPS
                    httponly=True,
                    expires=expires,
                    samesite="None"  # Allow cross-site cookie usage
                )

    return response
