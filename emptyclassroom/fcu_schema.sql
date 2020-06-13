CREATE TABLE User(
    name NCHAR(20) PRIMARY KEY
);

CREATE TABLE Post(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title NCHAR(50) NOT NULL,
    content NVARCHAR(300) NOT NULL,
    posttime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isPinned BOOLEAN DEFAULT FALSE,
    username NCHAR(20) NOT NULL REFERENCES User(name) ON UPDATE CASCADE
);

CREATE TABLE Building(
    name NCHAR(4) PRIMARY KEY
);

CREATE TABLE Classroom(
    id NCHAR(8) NOT NULL,
    socket TINYINT DEFAULT 0,
    ac BOOLEAN DEFAULT FALSE,
    building NCHAR(4) NOT NULL REFERENCES Building(name) ON UPDATE CASCADE,
    PRIMARY KEY(id, building)
);

CREATE TABLE Course(
    id INTEGER PRIMARY KEY,
    name NVARCHAR(30) NOT NULL,
    teachers NCHAR(15)
);

CREATE TABLE Period(
    session TINYINT DEFAULT 0,
    -- 0代表未排教室或周末
    -- 1代表星期一第一節 一天14節 依此類推 最多到70
    course INTEGER REFERENCES Course(id) ON UPDATE CASCADE,
    classroom NCHAR(8) REFERENCES Classroom(id) ON UPDATE CASCADE,
    building NCHAR(10) REFERENCES Classroom(building) ON UPDATE CASCADE,
    PRIMARY KEY(session, course, classroom, building)
);
