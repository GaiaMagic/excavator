#!/bin/bash

set -e

cleanBackup () {
  echo "Cleaning..."
  rm -rf excavator-*.7z backup
}

for arg in "$@"; do
  echo $arg
  case "$arg" in
  --remote-host)
    shift; REMOTEHOST=$1; shift;
    ;;
  --key)
    shift; SSHKEY=$1; shift;
    ;;
  esac
done

if [[ ! -z "$SSHKEY" ]]; then
  SSHKEY="-i "$SSHKEY""
fi

NOW="$(date '+%Y-%m-%d-%H-%M-%S')"
ARCHIVE="excavator-${NOW}.7z"
REMOTE="${REMOTEHOST:-localhost}:"
REMOTEDIR="Dropbox/backups/excavator/"

DIRNAME=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DIRNAME="$(readlink -f "${DIRNAME}")"
cd $(dirname "$DIRNAME")

echo "Time is now: $(date)."

cleanBackup

if ! ls excavator-*.7z 1>/dev/null 2>&1; then
  echo "Making database archive..."
  make backup-data-only
  7z a $ARCHIVE backup
fi

echo "Transfering..."
rsync \
  -e "ssh -o StrictHostKeyChecking=no $SSHKEY" \
  --bwlimit=100K \
  --rsync-path="mkdir -p $REMOTEDIR && rsync" \
  --partial \
  --progress \
  --update \
  excavator-*.7z crontab/rotate.py $REMOTE$REMOTEDIR

cleanBackup

echo "Rotating..."
ssh $REMOTEHOST "cd $REMOTEDIR && ./rotate.py"

echo "Done."
