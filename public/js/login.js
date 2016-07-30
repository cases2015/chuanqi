/**
 * Created by lcg on 16/7/29.
 */

'use strict';

$(function(){
    $(".submit").on('submit',function(ev){
        var error = $(".errorinfo");
        error.text('');
        error.hide();

        var username = $("#username").val();
        var password = $("#password").val();

        if(!username || !password){
            error.text('用户名或密码不能为空.');
            error.show();
        }

        $.ajax({
            type: 'POST',
            url: '/api/login' ,
            data: {username:username,password:password} ,
            success: function(response){
                if(response.code === 0){
                    window.location.href='./main.html';
                }
                else {
                    error.text('用户名或密码错误,请重试.');
                    error.show();
                }
            },
            error: function(response){
                error.text('登陆失败,请重试.');
                error.show();
            }
        });

        ev.preventDefault();
    });



});