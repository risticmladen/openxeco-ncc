import sys
import os

print("=== WSGI.PY STARTING ===")
print("WSGI importing app module")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv', 'lib', 'python3.8', 'site-packages'))

print("About to import app module")
try:
    # pylint: disable=wrong-import-position
    from app import app as application
    print("App import successful")
    assert application  # nosec
    print("Application assertion successful")
except Exception as e:
    print(f"WSGI ERROR: Failed to import app: {e}")
    import traceback
    traceback.print_exc()
    raise
