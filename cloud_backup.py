import glob
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import os
import sys
import argparse
import logging
import traceback
import gzip
from sh import pg_dump
from datetime import datetime
from socket import gethostname
import urllib.request

logging.basicConfig(
    filename='/home/bohdan/Projects/b2b_actual/scripts/logs.log', level=logging.INFO)

parser = argparse.ArgumentParser(description='Uploads file to cloud.')
parser.add_argument('-f', '--filename', nargs=1, type=str,
                    default=None, help='Name of file to upload')


def check_connection():
    try:
        urllib.request.urlopen('http://google.com', timeout=1)
        return True
    except urllib.request.URLError as err:
        return False

def upload(filename):
    logging.info(f'Start uploading {filename}')
    try:
        if not check_connection():
            print('Нет доступа к интернету. База не была выгружена на диск')
            return False
        hostname = gethostname()
        drive_filename = f'{hostname}_{filename}.gz'
        g_login = GoogleAuth(settings_file='settings.yaml')
        g_login.LocalWebserverAuth()
        drive = GoogleDrive(g_login)
        file_list = drive.ListFile({'q': "'root' in parents"}).GetList()
        try:
            for file1 in file_list:
                if file1['title'] == drive_filename:
                    file1.Delete()
        except Exception:
            pass
        file_drive = drive.CreateFile(
            {'title': drive_filename,
             'mimetype': 'application/gzip'})
        file_drive.SetContentFile(filename)
        file_drive.Upload()
        logging.info(f'Successfully uploaded {filename}')
        return 0
    except Exception:
        exc = traceback.format_exc()
        logging.exception(exc)
        return 1


def upload_dump(backup_file_name, database):
    with gzip.open(backup_file_name, 'wb') as backup:
        pg_dump('-d', database, _out=backup)
    upload(backup_file_name)


if __name__ == '__main__':
    args = parser.parse_args()
    logging.debug(f'Passed file is: {args.filename[0]}')
    upload_dump(args.filename[0])
    # if args.filename:
    #     if upload(args.filename[0]) == 0:
    #         logging.info(f'Succesfuly uploaded:{args.filename[0]}')
    #         sys.exit(0)
    #     else:
    #         sys.exit(1)
