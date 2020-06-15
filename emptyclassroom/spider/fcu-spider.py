import requests
import json
import time
import re
import sqlite3
import logging


logging.basicConfig(filename='unsuccess.log', filemode='w')


def unexpected(course):
    logging.warning(str(course))


def crawl_fcu():
    db = sqlite3.connect('instance\\fcu_ec.sqlite')
    target_url = 'http://coursesearch01.fcu.edu.tw/Service/Search.asmx/'
    headers = {'content-type': 'application/json',
               'accept': 'application/json'}
    base_data = {'baseOptions': {'lang': "cht", 'year': 108, 'sms': 2}}
    day_to_int = {
        '一': 1,
        '二': 2,
        '三': 3,
        '四': 4,
        '五': 5,
        '六': 6,
        '日': 7
    }
    degrees = ('1', '3', '4', '5')
    for degree in degrees:
        degree_data = base_data.copy()
        degree_data['degree'] = degree
        time.sleep(0.1)
        departments = json.loads(requests.post(
            target_url + 'GetDeptList', data=str(degree_data), headers=headers).text)
        departments = json.loads(departments['d'])
        print(departments)
        for department in departments:
            department_data = degree_data.copy()
            department_data['deptId'] = department['id']
            time.sleep(0.1)
            units = json.loads(requests.post(
                target_url + 'GetUnitList', data=str(department_data), headers=headers).text)
            units = json.loads(units['d'])
            print(units)
            for unit in units:
                unit_data = degree_data.copy()
                unit_data['unitId'] = unit['id']
                time.sleep(0.1)
                fcuclasses = json.loads(requests.post(
                    target_url + 'GetClassList', data=str(unit_data), headers=headers).text)
                fcuclasses = json.loads(fcuclasses['d'])
                print(fcuclasses)
                for fcuclass in fcuclasses:
                    fcuclass_data = base_data.copy()
                    fcuclass_data['typeOptions'] = {
                        'degree': degree,
                        'deptId': department['id'],
                        'unitId': unit['id'],
                        'classId': fcuclass['id']
                    }
                    time.sleep(0.1)
                    courses = json.loads(requests.post(
                        target_url + 'GetType1Result', data=str(fcuclass_data), headers=headers).text)
                    courses = json.loads(courses['d'])['items']
                    print(courses)
                    for course in courses:
                        periods_teachers = course['scr_period'].split()
                        print(periods_teachers)
                        locations = []
                        time_periods = []
                        for index, content in enumerate(periods_teachers):
                            if index % 2 == 0:
                                time_periods.append(periods_teachers[index])
                            elif index != len(periods_teachers) - 1:
                                locations.append(periods_teachers[index])
                        for index, location in enumerate(locations):
                            times = re.match(
                                '\((?P<day>[^A-Za-z0-9_\-])\)(?P<period>[\w\-]+)', time_periods[index])
                            if not times:
                                unexpected(course)
                                continue
                            times = times.groupdict()
                            print(times)
                            periods = times['period'].split('-')
                            if len(periods) > 1:
                                periods = range(
                                    int(periods[0]), int(periods[1]) + 1)
                            else:
                                periods = [int(periods[0])]
                            where = re.match(
                                '(?P<building>[^A-Za-z0-9_\s]+)(?P<classroom>[A-Za-z0-9_\-]*)', locations[index])
                            if not where:
                                unexpected(course)
                                continue
                            where = where.groupdict()
                            print(where)
                            if not where['classroom']:
                                if where['building'] != '未排教室':
                                    unexpected(course)
                                continue
                            if not list(db.execute('SELECT name FROM Building WHERE name = ?', (where['building'],))):
                                db.execute(
                                    'INSERT INTO Building (name) VALUES (?)', (where['building'],))
                            if not list(db.execute('SELECT id FROM Classroom WHERE id = ? AND building = ?', (where['classroom'], where['building']))):
                                db.execute('INSERT INTO Classroom (id, building) VALUES (?, ?)',
                                           (where['classroom'], where['building']))
                            if not list(db.execute('SELECT id FROM Course WHERE id = ?', (course['scr_selcode'],))):
                                db.execute('INSERT INTO Course (id, name, teachers) VALUES (?, ?, ?)', (
                                    course['scr_selcode'], course['sub_name'], periods_teachers[-1]))
                            for period in periods:
                                session = (
                                    day_to_int[times['day']] - 1) * 14 + period
                                if not list(db.execute('SELECT * FROM Period WHERE session = ? AND classroom = ? AND building = ?', (
                                        session, where['classroom'], where['building']))):
                                    db.execute('INSERT INTO Period (session, course, classroom, building) VALUES (?, ?, ?, ?)', (
                                        session, course['scr_selcode'], where['classroom'], where['building']))
                        db.commit()

                        # 未考慮多時段 未db.commit()
                        # scr_period = re.match(
                        #     '\s*\((?P<day>[^A-Za-z0-9_])\)\s*(?P<period>[\w\-]+)\s*(?P<building>[^A-Za-z0-9_\s]+)\s*(?P<classroom>[A-Za-z0-9_]*)\s*(?P<teachers>\S*)', course['scr_period']).groupdict()
                        # print(scr_period)
                        # if not db.execute('SELECT name FROM Building WHERE name = ?', (scr_period['building'],)):
                        #     db.execute(
                        #         'INSERT INTO Building (name) VALUES (?)', (scr_period['building'],))
                        # if not db.execute('SELECT id FROM Classroom WHERE id = ? AND building = ?', (scr_period['classroom'], scr_period['building'])):
                        #     db.execute('INSERT INTO Classroom (id, building) VALUES (?)',
                        #                (scr_period['classroom'], scr_period['building']))
                        # if not db.execute('SELECT id FROM Course WHERE id = ?', (course['scr_selcode'],)):
                        #     db.execute('INSERT INTO Course (id, name, teachers) VALUES (?, ?, ?)', (
                        #         course['scr_selcode'], course['sub_name'], scr_period['teachers']))
                        # periods = scr_period['period'].split('-')
                        # if len(periods) > 1:
                        #     periods = range(
                        #         int(periods[0]), int(periods[1]) + 1)
                        # else:
                        #     periods = [int(periods[0])]
                        # print(periods)
                        # for period in periods:
                        #     session = (
                        #         day_to_int[scr_period['day']] - 1) * 14 + period
                        #     if not db.execute('SELECT id FROM Course WHERE id = ?', (course['scr_selcode'],)):
                        #         db.execute('INSERT INTO Period (session, course, classroom, building) VALUES (?, ?, ?, ?)', (
                        #             period, course['scr_selcode'], scr_period['classroom'], scr_period['building']))


crawl_fcu()
