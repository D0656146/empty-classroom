currentBuilding = ""

function value(id) {
    return $('#' + id).val()
}

function checkRoomFormat() {
    var room = $('#room').val()
    var pattern = /^([0-9]{3,4}|B[0-9]{2,3})$/
    var checked = room.match(pattern)
    return checked
}

function checkTime() {
    var startAt = parseInt(value('startAt'))
    var endAt = parseInt(value('endAt'))

    console.log(endAt != 0)
    console.log(startAt <= endAt)
    return (startAt <= endAt) || (endAt == 0)
}

function inputAcceptable() {
    var checkedRoom = checkRoomFormat()
    var checkedTime = checkTime()
    var bool = true
    if (checkedTime == false) {
        alert("起始節次必須不大於結束節次")
        bool = false
    }
    if (checkedRoom == null && value('room') != "") {
        alert("教室編號格式錯誤，請重新輸入")
        bool = false
    }
    return bool
}

function packageData() {
    var startAt = parseInt(value('startAt'))
    var endAt = parseInt(value('endAt'))

    console.log([startAt, endAt])
    endAt = endAt == 0 ? startAt : endAt;
    console.log([startAt, endAt])
    var data = {
        "searchMode": parseInt(value("searchMode")),
        "dayOfWeek": parseInt(value("dayOfWeek")),
        "startAt": startAt,
        "endAt": endAt,
        "building": value("building"),
        "room": value("room")
    }

    console.log(data)
    return data
}

function clearResult() {
    $(".buildingImage").remove()
    $(".roomInformation").remove()
    $(".roomTable").remove()
    $("#hasNotSearched").show()
    $("#noResult").hide()
    currentBuilding = ""
}

function showResult(obj) {
    //console.log(obj["building"])
    $("#searchResult").append(`
        <div class="col-lg-6 col-md-6 col-12">
            <img src="../static/img/${obj.building}.jpg" class="img-thumbnail" alt="${obj.building}">
        </div>
        <div id="classLable" class="col-lg-6 col-md-6 col-12"></div>
    `)

    $("#classLable").append(`<h4> 以下為${currentBuilding}館的搜尋結果</h4>`)
    for (var i = 0; i < obj.rooms.length; i++) {
        console.log(obj.rooms[i])
        $("#classLable").append(`
            <div class="resultList">
                <button class="btn btn-outline-primary checkTable" type="button" id="${obj.building}${obj.rooms[i]}">
                    ${obj.building}${obj.rooms[i]}
                </button>
            </div>
        `)
    }
    if (obj.rooms.length == 0) {
        $("#classLable").append(`<h4> 沒有符合條件的結果 </h4>`)
    }
}

$("document").ready(function () {

    // no-used reset form
    //clearResult()
    $("#resetBtn").click(function () {
        $("#room").val("")
        alert('這個重設按鈕目前沒啥屁用，只是擺好看的')
    })

    // send require and data to server
    $('#sendBth').click(function () {

        if (inputAcceptable() == false) {
            return
        }

        var data = packageData()
        currentBuilding = $('#building').val()
        console.log(data)
        $.ajax({
            url: '/app/templates/mainPage.html',
            data: packageData(),
            type: "GET",
            success: function (e) {
                alert("success section")
                console.log(e)
                if (e.lenght == 0) {
                    $("noResult").show()
                }
                else {
                    for (var i = 0; i < e.lenght; i++) {
                        showResult(e[i])
                    }
                }
            },
            error: function () {
                alert("error section")
            }
        })
    })

    $('#testOutput').click(function () {
        clearResult()
        var x = {
            "building": "資電",
            "rooms": [404, 405, 406]
        }

        console.log(x)
        showResult(x)

    })

    $('.checkTable').click(function () {
        console.log(this.id)
    })
})




