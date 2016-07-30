/**
 * Created by lcg on 16/7/29.
 */

'use strict';

$(function () {

    $(".main-exit").click(function () {
        $('body').loading({message: '正在退出...'});

        $.ajax({
            type: 'GET',
            url: '/api/logout',
            complete: function () {
                window.location.href = '/';
            }
        });
    });


    var clearInputs = function () {
        $("#name").val('');
        $("#number").val('');
        $("#age").val('');
        $("#sex").val('');
        $("#date").val('');

        //p1
        for (var i = 0; i < 8; i++) {
            var key = 'p1_' + i;
            $('#' + key).val('');
        }

        //p2
        for (var i = 0; i < 33; i++) {
            var key = 'p2_' + i;
            $('#' + key).val('');
        }

        //p3
        $('input:radio[name=p3]').prop('checked', false);
    };

    $("#save").click(function () {

        var patient = {};

        //basic
        patient.name = $("#name").val().trim();
        patient.number = $("#number").val().trim();
        patient.age = $("#age").val().trim();
        patient.sex = $("#sex").val().trim();
        patient.date = $("#date").val().trim();


        if (patient.name.length <= 0 ||
            patient.number.length <= 0 ||
            patient.age.length <= 0 ||
            patient.sex.length <= 0 ||
            patient.date.length <= 0) {
            $.alert({
                title: '出错啦!',
                content: '姓名等基础信息不能为空!',
                confirmButton: '知道了'
            });

            return ;
        }

        //p1
        for (var i = 0; i < 8; i++) {
            var key = 'p1_' + i;
            patient[key] = $('#' + key).val();
        }

        //p2
        for (var i = 0; i < 33; i++) {
            var key = 'p2_' + i;
            patient[key] = $('#' + key).val();
        }

        //p3
        patient['p3'] = $('input:radio[name=p3]:checked').val();


        $('body').loading({message: '正在保存...'});
        $.ajax({
            type: 'POST',
            url: '/api/add',
            data: patient,
            complete: function () {
                $('body').loading('stop');
            },
            success: function (response) {
                if (response.code === 0) {
                    //添加成功
                    $.alert({
                        title: '恭喜你',
                        content: '保存成功!',
                        confirmButton: '知道了',
                        confirm: function () {
                            clearInputs();
                        }
                    });
                }
                else if (response.code === 10003) {
                    $.alert({
                        title: '出错啦!',
                        content: '你尚未登录或登录已过期!',
                        confirmButton: '知道了',
                        confirm: function () {
                            window.location.href = '/';
                        }
                    });
                }
                else {
                    $.alert({
                        title: '出错啦!',
                        content: '保存失败,请重试!',
                        confirmButton: '知道了'
                    });
                }
            },
            error: function (response) {
                $.alert({
                    title: '出错啦!',
                    content: '保存失败,请重试!',
                    confirmButton: '知道了'
                });
            }
        });

    });
});