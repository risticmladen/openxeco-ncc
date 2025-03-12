import magic
from email.mime.image import MIMEImage
from flask_mail import Message
import logging
import os

logging.basicConfig(level=logging.DEBUG)

def get_mime_type(file_name, file_data):
    mime = magic.Magic(mime=True)
    mime_type = mime.from_buffer(file_data)
    
    mime_types = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        # Add more file types as needed
    }
    
    file_extension = os.path.splitext(file_name)[-1].lower()
    
    return mime_types.get(file_extension, mime_type)

def send_email(mail, subject, recipients, html_body, cc=None, bcc=None):  # pylint: disable=too-many-arguments
    from config.config import MAIL_DEFAULT_SENDER  # pylint: disable=import-outside-toplevel
    msg = Message(
        subject,
        sender=("Do Not Reply NCC Cyprus at CITA", MAIL_DEFAULT_SENDER),
        recipients=recipients,
        cc=cc,
        bcc=bcc
    )
    msg.html = html_body

    with open("resource/static/ncclogo.png", 'rb') as f:
        msg.attach(
            "logo.png",
            "image/png",
            f.read(),
            "inline",
            headers=[
                ['Content-ID', '<logo>'],
            ]
        )

    try:
        mail.send(msg)
    except ConnectionRefusedError:
        raise Exception("An error occurred while connecting to the mail server")

def send_email_with_attachment(mail, subject, recipients, html_body, attachments, cc=None, bcc=None):
    from config.config import MAIL_DEFAULT_SENDER  # pylint: disable=import-outside-toplevel
    msg = Message(
        subject,
        sender=("Do Not Reply NCC Cyprus at CITA", MAIL_DEFAULT_SENDER),
        recipients=recipients,
        cc=cc,
        bcc=bcc
    )
    msg.html = html_body

    with open("resource/static/ncclogo.png", 'rb') as f:
        msg.attach(
            "logo.png",
            "image/png",
            f.read(),
            "inline",
            headers=[
                ['Content-ID', '<logo>'],
            ]
        )

    for attachment in attachments:
        file_name, file_data = attachment
        mime_type = get_mime_type(file_name, file_data)
        logging.debug(f'Attaching file {file_name} with MIME type {mime_type}')
        
        # Write the file to disk for additional verification
        with open(f'/tmp/{file_name}', 'wb') as f:
            f.write(file_data)
        
        msg.attach(file_name, mime_type, file_data)

    try:
        mail.send(msg)
    except ConnectionRefusedError:
        raise Exception("An error occurred while connecting to the mail server")
