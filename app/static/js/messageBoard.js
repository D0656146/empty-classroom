function getValue(id) {
    return $("#" + id).val()
}

$("document").ready(function () {
    $("#resetMessageBth").click(function () {
        var bool = confirm("確定是否重新填寫？")
        if (bool == true) {
            $('#messageTitle').val("")
            $('#message').val("")
        }
    })
})
