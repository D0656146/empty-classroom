function value(id) {
    return $('#' + id).val()
}

function checkRoomFormat() {
    var room = $('#room').val()
    var pattern = /^([0-9]{3,4}|B[0-9]{2,3})$/
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

function clearResult(){
    $(".buildingImage").remove()
    $(".roomInformation").remove()
    $(".roomTable").remove()
    $("#hasNotSearched").show()
    $("#noResult").hide()
}

function showResult(obj){
    //console.log(obj["building"])
    $("#searchResult").append(
        `
            <div class="col-lg-3 col-md-4 col-sm-12 col-12 buildingImage">
                <img src="../static/img/${obj["building"]}.jpg" class="img-thumbnail" alt="${obj["building"]}.jpg">
            </div> 
            <div class="col-lg-7 col-md-6 col-sm-12 col-12 roomInformation">
                <h5> ${obj["building"]}${obj["room"]} </h5>
                <p> 插座數：4，位於教室後方 </p>
                <p> 冷氣狀態：有節能管控 </p>
                <small>史英間驗說，越海斯由了外一濟格科有升司。自對何話大利文此的力跑求想，事放獎兒理面境改的過一、任動商知此國少機合教產情你傳照些真負後在是國寶中上，同不考視人功利！我思工這，期一常的率人北今不流樹是！她紀先頭令日什去是至不力願樣：花多商造得都這候，術求麼響不覺。</small>
            </div>
            <div class="col-lg-2 col-md-2 col-sm-12 col-12 roomTable">
                <button class="btn btn-info" id="${obj["building"]}${obj["room"]}Building"> 教室課表 </button>
            </div>
        `
    )
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
        console.log(data)
        $.ajax({
            url: '/app/templates/messageBoard.html',
            data: data,
            type: "GET",
            success: function(e){
                alert("success section")
                console.log(e)
                if(e.lenght == 0){
                    $("noResult").show()
                }
                else{
                    for(var i = 0; i < e.lenght; i++){
                        showResult(e[i])
                    }
                }
            },
            error: function(){
                alert("error section")
            }
        })
    })

    $('#testOutput').click(function(){
        clearResult()
        var x = {
            "searchMode": 0,
            "locate":[
                {
                    "building": "資電",
                    "room": 504,
                    "info": ""
                },
                {
                    "building": "人",
                    "room": 405,
                    "info": ""
                },
                {
                    "building": "中科",
                    "room": 406,
                    "info": ""
                }
            ] 
        }
        for(var i = 0; i < x["locate"].length; i++){
            console.log(x["locate"][i])
            showResult(x["locate"][i])
            if(i < x["locate"].length - 1){
                $("#searchResult").append(
                    `
                        <div class="breakline col-12"></div>
                    `
                )
            }
        }
    })
})




