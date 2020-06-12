import sqlite3

db = sqlite3.connect('instance\\fcu_ec.sqlite')
with open('tests\\testdata.sql', encoding='utf-8') as f:
    db.executescript(f.read())
