#!/usr/bin/env python

from os import devnull
from sys import exit
from glob import glob
from subprocess import call as execute

import datetime

PREFIX = 'excavator'

commands = []

def rm(files):
    return ["rm", "-f"] + files

def zip(dest, files):
    return ["7z", "a", dest] + files

for year in range(2015, 2020):
    if len(glob("%s-%02d-*.7z" % (PREFIX, year))) == 0: break
    for month in range(1 ,13):
        if len(glob("%s-%02d-%02d-*.7z" % (PREFIX, year, month))) == 0: continue
        for day in range(1, 32):
            try:
                date = datetime.datetime(year, month, day)
                if date.date() == datetime.date.today(): continue # ignore today
            except:
                continue
            filename = "%s-%02d-%02d-%02d.7z" % (PREFIX, year, month, day)
            pattern = "%s-%02d-%02d-%02d-*.7z" % (PREFIX, year, month, day)
            files = glob(pattern)
            if len(files) == 0: continue
            commands.append(zip(filename, files))
            commands.append(rm(files))

executed = 0
with open(devnull, "w") as null:
    for command in commands:
        ret = execute(command, stdout=null)
        if ret != 0:
            print "Command: %s exited with non-zero status code (%d)" % \
                (" ".join(command), ret)
            break
        executed += 1

print "executed %d command(s) of total %d" % (executed, len(commands))
if executed != len(commands): exit(1)
