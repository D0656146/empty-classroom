from app.db import get_db
from app.main.main import main
from flask import render_template, request


@main.route('/')
def root():
    return render_template('index.html')


@main.route('/search/')
def search():
    building = request.args.get('building')
    if building:
        room = request.args.get('room')
        if room:
            return search_curriculum(building, room)
        else:
            dayOfWeek = request.args.get('dayOfWeek')
            startAt = request.args.get('startAt')
            endAt = request.args.get('endAt')
            if not startAt or not endAt:
                return 'leak of arguments'
            sessions = range((dayOfWeek - 1) * 7 + startAt,
                             (dayOfWeek - 1) * 7 + endAt + 1)
            return search_empty_classroom(building, sessions)
    else:
        return render_template('mainPage.html')


def search_curriculum(building, room):
    db = get_db()
    cursor = db.execute(
        'SELECT session, course FROM Period WHERE building = ? AND room = ? ORDER BY session', (building, room))
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


def search_empty_classroom(building, sessions):
    db = get_db()
    cursor = db.execute(
        'SELECT session, course FROM Period WHERE building = ? AND room = ? ORDER BY session', (building, room))
    return 'not yet done'


@main.route('/board/')
def board():
    db = get_db()
    page = request.args.get('page')
    if page:
        cursor = db.execute(
            'SELECT * FROM Post ORDER BY isPinned DESC, posttime DESC')
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
