from emptyclassroom.db import get_db
from emptyclassroom.main.main import main
from flask import render_template, request, jsonify, redirect


@main.route('/')
def root():
    return render_template('index.html')


@main.route('/search/')
def search():
    searchMode = request.args.get('searchMode')
    searchMode = '' if not searchMode else int(searchMode)
    building = request.args.get('building')
    room = request.args.get('room')
    if searchMode == 0:
        dayOfWeek = request.args.get('dayOfWeek')
        dayOfWeek = '' if not dayOfWeek else int(dayOfWeek)
        startAt = request.args.get('startAt')
        startAt = '' if not startAt else int(startAt)
        endAt = request.args.get('endAt')
        endAt = '' if not endAt else int(endAt)
        if not building or not startAt or not endAt or startAt < endAt:
            return 'leak of arguments'
        sessions = range((dayOfWeek - 1) * 7 + startAt,
                         (dayOfWeek - 1) * 7 + endAt + 1)
        return search_empty_classroom(building, room, sessions)
    elif searchMode == 2:
        if not building or not room:
            return 'unknown classroom'
        return search_curriculum(building, room)
    elif not searchMode:
        return render_template('mainPage.html')
    else:
        return 'unknown search mode'


def search_curriculum(building, room):
    db = get_db()
    cursor = db.execute(
        "SELECT session, course FROM Period WHERE building = ? AND classroom = ? ORDER BY session;", (building, room))
    period_fields = ('session', 'course')
    timetable = []
    for period in cursor:
        json_period = {}
        for index, field in enumerate(period):
            json_period[period_fields[index]] = field
        timetable.append(json_period)
    curriculum = {'locate': {'building': building, 'room': room}}
    curriculum['timetable'] = timetable
    return jsonify(curriculum)


def search_empty_classroom(building, room, sessions):
    db = get_db()
    command = f"SELECT id, socket, ac FROM Classroom WHERE building = '{building}'"
    if room:
        command += f" AND id = '{room}'"
    command += ' AND id NOT IN (SELECT classroom FROM Period WHERE'
    for session in sessions:
        command += f' session = {session} OR'
    command = command[0:-2]
    command += ') ORDER BY id;'
    cursor = db.execute(command)
    classroom_field = ('room', 'socket', 'ac')
    classrooms = []
    for classroom in cursor:
        json_classroom = {}
        for index, field in enumerate(classroom):
            json_classroom[classroom_field[index]] = field
        classrooms.append(json_classroom)
    empty_classrooms = {'building': building, 'classrooms': classrooms}
    return jsonify(empty_classrooms)


@main.route('/board/', methods=['GET', 'POST'])
def board():
    db = get_db()
    if request.method == 'POST':
        data = request.get_json()
        db.execute('INSERT INTO User (name) VALUES (?);', (data['username'],))
        db.execute('INSERT INTO Post (title, content, username) VALUES (?, ?, ?);',
                   (data['title'], data['content'], data['username']))
        return redirect('/board/')
    else:
        page = request.args.get('page')
        page = '' if not page else int(page)
        if page:
            cursor = db.execute(
                'SELECT * FROM Post ORDER BY isPinned DESC, posttime DESC;')
            post_fields = ('id', 'title', 'content',
                           'posttime', 'isPinned', 'username')
            posts = []
            for index, post in enumerate(cursor):
                if index >= page * 10:
                    break
                if index < (page - 1) * 10:
                    continue
                json_post = {}
                for index, field in enumerate(post):
                    json_post[post_fields[index]] = field
                posts.append(json_post)
            return jsonify(posts)
        else:
            return render_template('messageBoard.html')
