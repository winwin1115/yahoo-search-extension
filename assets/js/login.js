$(document).ready(function() {
    $('#login').click(function () {
        var password = $('#password').val();
        var hash = CryptoJS.MD5(password);
        if(hash == '1d0258c2440a8d19e716292b231e3190')
        {
            chrome.storage.local.set({"user_name": 'loggedIn'}, function(){
                notify_success("ログインしました。");
                setTimeout(function() {
                    location.href = 'index.html';
                }, 2000);
            });
        }
        else
            notify_warning("ログイン情報を確認してください！")
    });

    function notify_warning(message)
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

    function notify_success(message)
    {
        $.notify({
            title: '成功',
            message: message
        },
        {
            type:'success',
            allow_dismiss:false,
            newest_on_top:false ,
            mouse_over:false,
            showProgressbar:false,
            spacing:10,
            timer:2000,
            placement:{
              from:'top',
              align:'right'
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