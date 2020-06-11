var currentPage = 0

function getValue(id) {
    return $("#" + id).val()
}

function checkInput(){
    var title = getValue("messageTitle")
    var nickname = getValue("messageNickname")
    var context = getValue('message')
    if(title.length < 5 || title.length > 50){
        alert('標題需要 5~50 個字元')
        return false
    }
    else if(nickname.length < 3 || nickname.length > 20){
        alert('暱稱需要 3~20 個字元')
        return false
    }
    else if(context.length < 10 || context.length > 300){
        alert('內文需要 10~300 個字元')
        return false
    }
    return true;
}

function sendMessage(){
    var x = {
        'title': getValue('messageTitle'),
        'content': getValue('message'),
        'user': getValue('messageNickname')
    }
    console.log(x)
    return x
}

function getPage(){

}

$("document").ready(function () {
    $("#resetMessageBth").click(function () {
        var bool = confirm("確定是否重新填寫？")
        if (bool == true) {
            $('#messageTitle').val("")
            $('#message').val("")
        }
    })

    $("#postMessageBth").click(function() {
        if(checkInput()){
            if(window.confirm("確定要發表文章？")){
                $.ajax({
                    url: '../../main/main.py',
                    data: sendMessage(),
                    datatype: 'json',
                    type: "GET",
                    success: function(e){
                        alert('在審核後將會顯示')
                    },
                    error: function(e){
                        alert('發生不可預期的錯誤')
                    }

                })
            }
        }
        
    })
})

/*
{
    'page': 1
}

{

}
*/
