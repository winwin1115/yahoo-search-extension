$(document).ready(function() {
    chrome.storage.local.get(["user_name", "seller_id"], function (res) {
        if(res['user_name'] == undefined)
            location.href = 'login.html';
        else
        {
            var seller_id = res['seller_id'];
            if(seller_id)
            {
                var seller_array = seller_id.split(', ');
                $.each(seller_array, function (i, item) {
                    $('#list').append($('<option>', {
                        value: item,
                        text: item
                    }));
                });
            }
        }
    });

    $('#btnAdd').click(function (e) {
        e.preventDefault();
        var seller_id = $('#name').val();
        if(!seller_id)
            notify_func("セラーIDを入力してください！")
        else
        {
            chrome.storage.local.get(["seller_id"], function (res) {
                if(res['seller_id'])
                {
                    var new_seller = res['seller_id'] + ', ' + seller_id;
                    chrome.storage.local.set({"seller_id": new_seller}, function () {
                        location.reload();
                    });
                }
                else
                {
                    chrome.storage.local.set({"seller_id": seller_id}, function () {
                        location.reload();
                    });
                }
            });
        }
    });

    $('#btnRemove').click(function (e) {
        e.preventDefault();
        var selected = $('#list').val();
        if(!selected.length)
            notify_func("セラーIDを選択してください！");
        else
        {
            chrome.storage.local.get(["seller_id"], function (res) {
                console.log();
                if(res['seller_id'].indexOf(selected + ', ') != -1)
                    var new_seller = res['seller_id'].replace(selected + ', ', '');
                else
                    var new_seller = res['seller_id'].replace(selected, '');

                chrome.storage.local.set({"seller_id": new_seller}, function () {
                    location.reload();
                });
            });
        }
    });

    $('.log-btn').click(function () {
        chrome.storage.local.remove(["user_name"], function () {
            location.href = "login.html";
        });
    });

    function notify_func(message)
    {
        $.notify({
            title: '警告',
            message: message
        },
        {
            type:'danger',
            allow_dismiss:false,
            newest_on_top:false ,
            mouse_over:false,
            showProgressbar:false,
            spacing:10,
            timer:2000,
            placement:{
              from:'top',
              align:'left'
            },
            offset:{
              x:30,
              y:30
            },
            delay:1000 ,
            z_index:10000,
            animate:{
              enter:'animated bounce',
              exit:'animated bounce'
          }
        });
    }
});