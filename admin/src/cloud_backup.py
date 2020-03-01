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
import subprocess
from datetime import datetime


now = datetime.now()
logging.basicConfig(
    filename=f'admin/logs/logs{datetime.date(now)}_{datetime.time(now)}.log', level=logging.INFO)

parser = argparse.ArgumentParser(description='Uploads file to cloud.')
parser.add_argument('-f', '--filename', nargs=1, type=str,
                    default=None, help='Name of file to upload')


def check_connection():
    try:
        urllib.request.urlopen('http://google.com', timeout=1)
        return True
    except urllib.request.URLError as err:
        return False


def upload(filepath):
    filename = os.path.basename(filepath)
    logging.info(f'Start uploading {filename}')
    try:
        if not check_connection():
            print('Нет доступа к интернету. База не была выгружена на диск')
            return False
        g_login = GoogleAuth(settings_file='admin/config/settings.yaml')
        g_login.LocalWebserverAuth()
        drive = GoogleDrive(g_login)
        file_list = drive.ListFile({'q': "'root' in parents"}).GetList()
        try:
            for file1 in file_list:
                if file1['title'] == filename:
                    file1.Delete()
        except Exception:
            pass
        file_drive = drive.CreateFile(
            {'title': filename,
             'mimetype': 'application/gzip'})
        file_drive.SetContentFile(filepath)
        file_drive.Upload()
        logging.info(f'Successfully uploaded {filename}')
        return 0
    except Exception:
        exc = traceback.format_exc()
        logging.exception(exc)
        return 1


def upload_dump(backup_file_name, database, user):
    backup_file = f'admin/backups/{user}_{backup_file_name}.gz'
    with gzip.open(backup_file, 'wb') as f:
        popen = subprocess.Popen(
            ['pg_dump', '-U', user, '-d', database], stdout=subprocess.PIPE, universal_newlines=True)

        for stdout_line in iter(popen.stdout.readline, ""):
            f.write(stdout_line.encode('utf-8'))

        popen.stdout.close()
        popen.wait()
    upload(backup_file)
