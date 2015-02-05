#!/bin/bash

set -e

if ! command -v 7z >/dev/null 2>&1; then
  echo "Please install 7zip: sudo apt-get install p7zip-full."
  exit 1
fi

DIRNAME=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DIRNAME="$(readlink -f "${DIRNAME}")"
BACKUPCMD="$(readlink -f "${DIRNAME}/backup.sh")"

if [[ -f "$BACKUPCMD" ]]; then
  BACKUPCMD="/bin/bash ${BACKUPCMD}"
else
  BACKUPCMD=""
fi

while [[ -z "$MINUTE" ]]; do
  printf "Please enter minute for crontab (e.g. 10,40 to backup every 30 minutes): "
  read MINUTE
done

while [[ -z "$REMOTEHOST" ]]; do
  printf "Please enter remote server host or IP (e.g. username@host): "
  read REMOTEHOST
done

SSHKEY="$(readlink -f ~/.ssh/id_rsa)"

while [[ ! -f "$SSHKEY" ]]; do
  printf "Please enter the file of the SSH key: "
  read SSHKEY
done

while [[ -z "$BACKUPCMD" ]]; do
  echo "Please enter the command of the backup script(e.g. /bin/bash /root/backup.sh): "
  read BACKUPCMD
done

crontab -l 2>/dev/null | grep -v "$DIRNAME" | { cat;
echo "$MINUTE * * * * $BACKUPCMD --remote-host $REMOTEHOST --key $SSHKEY >/tmp/excavator-backup.log 2>&1"; } | crontab -

echo "Successfully updated crontab:"
crontab -l
