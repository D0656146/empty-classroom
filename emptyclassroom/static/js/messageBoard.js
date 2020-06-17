var currentPage = 0

function getValue(id) {
    return $("#" + id).val()
}

function checkInput() {
    var title = getValue("messageTitle")
    var nickname = getValue("messageNickname")
    var context = getValue('message')
    if (title.length < 5 || title.length > 50) {
        alert('標題需要 5~50 個字元')
        return false
    }
    else if (nickname.length < 3 || nickname.length > 20) {
        alert('暱稱需要 3~20 個字元')
        return false
    }
    else if (context.length < 10 || context.length > 300) {
        alert('內文需要 10~300 個字元')
        return false
    }
    return true;
}

function sendMessage() {
    var x = {
        'title': getValue('messageTitle'),
        'content': getValue('message'),
        'username': getValue('messageNickname')
    }
    console.log(x)
    return x
}

function showMessage(e) {
    if(e.isPinned){
        $('#topicMessageGroup').append(`
            <div class="col-lg-4 col-md-4 col-sm-12 col-12">
                <img src="../static/img/test.png" class="img-thumbnail" alt="photo">
            </div>
            <div class="col-lg-8 col-md-8 col-sm-12 col-12">
                <h4 class="font-weight-bolder"> ${e.title} </h4>
                <p> ${e.content} </p>
                <small> 由 <a href="#"> ${e.username} </a> 發文於 ${e.posttime}，訊息編號：<a href="#">T${e.id}</a></small>
            </div>
            <div class="col-lg-12 col-md-12 col-sm-12 col-12">
                <button class="btn btn-primary replyBtn"> 回應 </button>
            </div>
        `)
    }else{
        $('#railButton').before(`
            <div class="col-lg-4 col-md-4 col-sm-12 col-12">
                <img src="../static/img/test.png" class="img-thumbnail" alt="photo">
            </div>
            <div class="col-lg-8 col-md-8 col-sm-12 col-12">
                <h4 class="font-weight-bolder"> ${e.title} </h4>
                <p> ${e.content} </p>
                <small> 由 <a href="#"> ${e.username} </a> 發文於 ${e.posttime}，訊息編號：<a href="#">T${e.id}</a></small>
            </div>
            <div class="col-lg-12 col-md-12 col-sm-12 col-12">
                <button class="btn btn-primary replyBtn"> 回應 </button>
            </div>
        `)
    }
    $(".replyBtn").click(function(){
        var title = $(this).parent().prev().children("h4").text()
        $("#messageTitle").val(`Re: ${title}`)
        location.hash = "#leaveMessageGroup"
        console.log(title)
    })
}

function getPage() {
    $.ajax({
        data: {'page': ++currentPage},
        dataType: 'json',
        type: 'GET',
        success: function (e) {
            var len = e.length
            for (var i = 0; i < len; i++) {
                showMessage(e[i])
            }
            if (len < 10){
                $('#railButton').before(`<h4>沒有更多留言了</h4>`)
            }
        },
        error: function (e) {
            alert(`加載留言發生不可預期的錯誤，請稍後再試`)
            currentPage--
        }
    })
}


$("document").ready(function () {
    
    $(".get-content").click(function () {
        getPage()
    })

    $("#resetMessageBth").click(function () {
        var bool = confirm("確定是否重新填寫？")
        if (bool == true) {
            $('#messageTitle').val("")
            $('#message').val("")
        }
    })

    $("#postMessageBth").click(function () {
        if (checkInput()) {
            if (window.confirm("確定要發表文章？")) {
                $.ajax({
                    data: JSON.stringify(sendMessage()),
                    contentType: 'application/json',
                    dataType: 'json',
                    type: "POST",
                    // 放棄重整頁面
                    /* success: function (e) {
                        console.log(e)
                        // location.href = e.location
                        alert('在審核後將會顯示')
                    }, */
                    complete: function (xhr, status) {
                        if (xhr.status == 200) {
                            alert('發表成功')
                            location.reload()
                        } else {
                            alert('發生不可預期的錯誤，請稍後再試')
                        }
                    }
                })
            }
        }
    })

    $('.test').click(function () {
        var x = [{
            'id': 1,
            'title': "AAA",
            'content': "123456789",
            'posttime': "2020-06-03T12:25:43.511Z",
            'isPinned': true,
            'username': "jibanyan"
        },
        {
            'id': 2,
            'title': "AAA",
            'content': "123456789",
            'posttime': "2020-06-03T12:25:43.511Z",
            'isPinned': false,
            'username': "jibanyan"
        }]

        for(var i = 0; i < x.length; i++){
            showMessage(x[i])
        }
    })

    getPage()
    $(".test").hide()
})
