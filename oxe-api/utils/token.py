import random
import bcrypt
import string
# import string
from itsdangerous import URLSafeTimedSerializer

from config.config import SECRET_KEY, SECURITY_SALT


def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.dumps(email, salt=SECURITY_SALT)


def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.loads(
        token,
        salt=SECURITY_SALT,
        max_age=expiration
    )


# def generate_otp(otp_size = 6):
#     final_otp = ''
#     for _ in range(otp_size):
#         final_otp = final_otp + str(random.randint(0,9))
#     return final_otp

def generate_otp(otp_size=6):
    half_size = otp_size // 2
    numbers = ''.join(random.choice(string.digits) for _ in range(half_size))
    latin_characters = ''.join(random.choice(string.ascii_letters) for _ in range(otp_size - half_size))
    final_otp = numbers + latin_characters
    final_otp = ''.join(random.sample(final_otp, len(final_otp)))  # Shuffle the OTP
    print(final_otp)
    return final_otp

def hash_otp(otp):
    salt = bcrypt.gensalt()
    otp_bytes = otp.encode('utf-8')
    return bcrypt.hashpw(otp_bytes, salt)


def verify_otp(user_otp, otp):
    user_bytes = user_otp.encode('utf-8')
    otp_bytes = otp.encode('utf-8')
    return bcrypt.checkpw(user_bytes, otp_bytes)
