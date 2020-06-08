from app.db import get_db
from app.main.main import main
from flask import render_template, request


@main.route('/')
def root():
    return render_template('index.html')


@main.route('/search/')
def search():
    searchMode = request.args.get('searchMode')
    building = request.args.get('building')
    room = request.args.get('room')
    if searchMode == 0:
        dayOfWeek = request.args.get('dayOfWeek')
        startAt = request.args.get('startAt')
        endAt = request.args.get('endAt')
        if not building or not startAt or not endAt or startAt < endAt:
            return 'leak of arguments'
        sessions = range((dayOfWeek - 1) * 7 + startAt,
                         (dayOfWeek - 1) * 7 + endAt + 1)
        return search_empty_classroom(building, room, sessions)
    elif searchMode == 2:
        if not building or not room:
            return 'unknown classroom'
        return search_curriculum(building, room)
    elif searchMode is None:
        return render_template('mainPage.html')
    else:
        return 'unknown search mode'


def search_curriculum(building, room):
    db = get_db()
    cursor = db.execute(
        'SELECT session, course FROM Period WHERE building = ? AND room = ? ORDER BY session;', (building, room))
    period_fields = ('session', 'course')
    timetable = []
    for period in cursor:
        json_period = {}
        for index, field in enumerate(period):
            json_period[period_fields[index]] = field
        timetable.append(copy.deepcopy(json_period))
    curriculum = {'locate': {'building': building, 'room': room}}
    curriculum['timetable'] = timetable
    return curriculum


def search_empty_classroom(building, room, sessions):
    db = get_db()
    command = 'SELECT id, socket, ac FROM Classroom WHERE building = ${building}'
    if room:
        command += ' AND room = ${room}'
    command += ' AND id NOT EXISTS (SELECT classroom FROM Period WHERE'
    for session in sessions:
        command += ' session = ${session} OR'
    command = command[0:-2]
    command += ') ORDER BY id;'
    cursor = db.execute(command)
    classroom_field = ('room', 'socket', 'ac')
    classrooms = []
    for classroom in cursor:
        json_classroom = {}
        for index, field in enumerate(classroom):
            json_classroom[classroom_field[index]] = field
        classrooms.append(copy.deepcopy(json_classroom))
    empty_classrooms = {'building': building, 'classrooms': classrooms}
    return empty_classrooms


@main.route('/board/')
def board():
    db = get_db()
    if request.method == 'POST':
        db.execute('INSERT INTO table_name (title, content, username) VALUES (?, ?, ?);',
                   (request.values[title], request.values[content], request.values[username]))
        return redirect("/board/")
    else:
        page = request.args.get('page')
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
                posts.append(copy.deepcopy(json_post))
            return posts
        else:
            return render_template('messageBoard.html')
