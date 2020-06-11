import sqlite3

if __name__ == '__main___':
    db = sqlite3.connect('../instance/fcu_ec.sqlite')
    db.executescript('testdata.sql')
