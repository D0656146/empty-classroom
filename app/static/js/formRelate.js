function value(id) {
    return $('#' + id).val()
}

function checkRoomFormat() {
    var room = $('#room').val()
    var pattern = /[0-9]{3,4}|B[0-9]{2,3}/
    var checked = room.match(pattern)
    return checked
}

function checkTime(){
    var startAt = parseInt(value('startAt'))
    var endAt = parseInt(value('endAt'))

    console.log(endAt != 0)
    console.log(startAt <= endAt)
    return (startAt <= endAt) || (endAt == 0)
}

function inputAcceptable (){
    var checkedRoom = checkRoomFormat()
    var checkedTime = checkTime()
    var bool = true
    if(checkedTime == false){
        alert("起始節次必須不大於結束節次")
        bool = false
    }
    if(checkedRoom == null && value('room') != ""){
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
        "period": {
            "dayOfWeek": parseInt(value("dayOfWeek")),
            "startAt": startAt,
            "endAt": endAt
        },
        "locate": {
            "building": value("building"),
            "room": value("room")
        }
    }

    console.log(data)
    return data
}

$("document").ready(function () {

    // no-used reset form
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
        console.log(data)
        $.ajax({
            url: '../a.html',
            data: data,
            type: "POST",
            success: function(data){
                alert("success section")
            },
            error: function(){
                alert("error section")
            }
        })
    })
})