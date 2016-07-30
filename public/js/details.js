/**
 * Created by chenguanglv on 16/7/30.
 */

'use strict';

$(function(){
    var patient = null;

    $(".main-exit").click(function(){
        $('body').loading({message:'正在退出...'});

        $.ajax({
            type: 'GET',
            url: '/api/logout',
            complete: function(){
                window.close();
            }
        });
    });


    var QueryString = {
        data: {},
        Initial: function() {
            var aPairs, aTmp;
            var queryString = new String(window.location.search);
            queryString = queryString.substr(1, queryString.length); //remove   "?"
            aPairs = queryString.split("&");
            for (var i = 0; i < aPairs.length; i++) {
                aTmp = aPairs[i].split("=");
                this.data[aTmp[0]] = aTmp[1];
            }
        },
        GetValue: function(key) {
            return this.data[key];
        }
    };
    QueryString.Initial();

    var enableEdit = function(enable){
        $('.detail-main input').attr("disabled",!enable);
        $('.detail-main input').css('border-width', enable ? '1px' : '0px' );
    };

    var resetPatient = function(){
        for (var p in patient){
            $('#' + p).val(patient[p]);
        }

        if(patient.p3){
            $("input[name='p3'][value=" + patient.p3 + "]").prop("checked",true);
        }
    };

    var deletePatient = function(){
        $('body').loading({message:'正在删除...'});
        $.ajax({
            type: 'GET',
            url: '/api/delete',
            data: {pid: patient.objectId},
            complete: function(){
                $('body').loading('stop');
            },
            success: function(response){
                if(response.code === 0){
                    $.alert({
                        title: '恭喜!',
                        content: '删除成功!',
                        confirmButton: '知道了',
                        confirm: function(){
                            window.location.href = '/';
                        }
                    });
                }
                else if( response.code === 10003){
                    $.alert({
                        title: '出错啦!',
                        content: '你尚未登录或登录已过期!',
                        confirmButton: '知道了',
                        confirm: function(){
                            window.location.href = '/';
                        }
                    });
                }
                else {
                    $.alert({
                        title: '出错啦!',
                        content: '删除失败,请重试!',
                        confirmButton: '知道了'
                    });
                }
            },
            error: function(response){
                $.alert({
                    title: '出错啦!',
                    content: '删除失败,请重试!',
                    confirmButton: '知道了'
                });
            }
        });
    };

    var updatePatient = function(){

        patient.pid = patient.objectId;
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
            patient[key] = $('#'+key).val();
        }

        //p2
        for (var i = 0; i < 33; i++) {
            var key = 'p2_' + i;
            patient[key] = $('#'+key).val();
        }

        //p3
        patient['p3'] = $('input:radio[name=p3]:checked').val();

        $('body').loading({message:'正在保存...'});
        $.ajax({
            type: 'POST',
            url: '/api/update',
            data: patient,
            complete: function(){
                $('body').loading('stop');
            },
            success: function(response){
                if(response.code === 0){
                    //添加成功
                    $.alert({
                        title: '恭喜你',
                        content: '保存成功!',
                        confirmButton: '知道了',
                        confirm: function(){
                            $("#edit-container").hide();
                            $("#view-container").show();
                            enableEdit(false);
                        }
                    });
                }
                else if( response.code === 10003){
                    $.alert({
                        title: '出错啦!',
                        content: '你尚未登录或登录已过期!',
                        confirmButton: '知道了',
                        confirm: function(){
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
            error: function(response){
                $.alert({
                    title: '出错啦!',
                    content: '保存失败,请重试!',
                    confirmButton: '知道了'
                });
            }
        });
    };

    var initPatient = function(){
        var pid = QueryString.GetValue('pid');

        $('body').loading({message:'正在加载...'});
        $.ajax({
            type: 'GET',
            url: '/api/details',
            data: {pid: pid},
            complete: function(){
                $('body').loading('stop');
            },
            success: function(response){
                if(response.code === 0){
                    patient = response.patient;

                    for (var p in response.patient){
                        $('#' + p).val(response.patient[p]);
                    }

                    if(response.patient.p3){
                        $("input[name='p3'][value=" + response.patient.p3 + "]").prop("checked",true);
                    }
                }
                else if( response.code === 10003){
                    $.alert({
                        title: '出错啦!',
                        content: '你尚未登录或登录已过期!',
                        confirmButton: '知道了',
                        confirm: function(){
                            window.location.href = '/';
                        }
                    });
                }
                else {
                    $.alert({
                        title: '出错啦!',
                        content: '数据加载失败,请重试!',
                        confirmButton: '知道了'
                    });
                }
            },
            error: function(response){
                $.alert({
                    title: '出错啦!',
                    content: '数据加载失败,请重试!',
                    confirmButton: '知道了'
                });
            }
        });
    };


    $("#edit").click(function(){
        $("#edit-container").show();
        $("#view-container").hide();
        enableEdit(true);
    });

    $("#save").click(function(){
        updatePatient();
    });

    $("#cancel").click(function(){
        $("#edit-container").hide();
        $("#view-container").show();
        resetPatient();
        enableEdit(false);
    });

    $("#delete").click(function(){
        $.confirm({
            title: '删除病例!',
            content: '删除后将不可找回,确认删除吗?',
            confirmButton: '删除',
            cancelButton: '取消',
            confirm: function(){
                deletePatient();
            },
            cancel: function(){

            }
        });
    });

    enableEdit(false);
    initPatient();
});