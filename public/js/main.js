/**
 * Created by lcg on 16/7/29.
 */

'use strict';

$(function(){
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

    var currentPage = 0;
    var currentKeyword = '';
    var pageSize = 10;

    if(typeof(QueryString.GetValue('p')) != 'undefined'){
        currentPage = parseInt(QueryString.GetValue('p'));
    }

    if(typeof(QueryString.GetValue('k')) != 'undefined'){
        currentKeyword = QueryString.GetValue('k');
    }

    if(typeof (currentKeyword) != 'undefined'){
        $('#keyword').val(decodeURIComponent(currentKeyword));
    }

    var createList = function(list){
        var listHtml = '<table id="list" class="table table-hover">';

        for(var i = 0; i < list.length; i++){
            listHtml += '<tr>';
            listHtml += '<td style="width: 20%;">';
            listHtml += currentPage * pageSize + (i + 1);
            listHtml += '<input type="hidden" value="' + list[i].objectId + '">';
            listHtml += '</td>';
            listHtml += '<td style="width: 20%;">';
            listHtml += list[i].name;
            listHtml += '</td>';
            listHtml += '<td style="width: 20%;">';
            listHtml += list[i].number;
            listHtml += '</td>';
            listHtml += '<td style="width: 20%;">';
            listHtml += list[i].sex;
            listHtml += '</td>';
            listHtml += '<td style="width: 20%;">';
            listHtml += list[i].age;
            listHtml += '</td>';
            listHtml += '</tr>';
        }

        listHtml += '</table>';

        $('#list').html(listHtml);
        $('#list tr').click(function(){
            window.open('details.html?pid=' + $(this).find('input').val());
        })
    };

    var getListUrl = function(page){
        if(typeof (page) != 'undefined'){
            return 'main.html?p=' + page + '&k=' + encodeURIComponent(currentKeyword);
        }
        return 'main.html?p=' + currentPage + '&k=' + encodeURIComponent(currentKeyword);
    };

    var createNav = function(total){
        var pageCount = Math.ceil(total / pageSize);

        var begin = currentPage - 2 >= 0 ? currentPage - 2 : 0;
        var end = begin + 4 > pageCount -1 ? pageCount - 1 : begin + 4;

        var navHtml = '<li';
        if(currentPage === 0){
            navHtml += ' class="disabled"><a href="#"';
        }
        else {
            navHtml += '><a href="' + getListUrl(currentPage - 1) + '"';
        }
        navHtml += ' aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';

        for (var i = begin; i <= end; i++){
            if( i === currentPage){
                navHtml += '<li class="active"><a href="#">';
            }
            else {
                navHtml += '<li><a href="' + getListUrl(i) + '">';
            }

            navHtml += (i + 1) + '</a>';
            navHtml += '</li>';
        }

        navHtml += '<li';
        if(currentPage === pageCount - 1){
            navHtml += ' class="disabled"><a href="#"';
        }
        else {
            navHtml += '><a href="' + getListUrl(currentPage + 1) + '"';
        }
        navHtml +=' aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';

        $('#nav').html(navHtml);
    };

    var queryPatient = function(){
        var data = {};
        if(typeof(currentPage) !== 'undefined'){
            data.n = currentPage;
        }

        if(typeof(pageSize) !== 'undefined'){
            data.s = pageSize;
        }

        if(currentKeyword && currentKeyword.length > 0){
            data.k = currentKeyword;
        }

        $('body').loading({message: '正在加载...'});

        $.ajax({
            type: 'GET',
            url: '/api/list',
            data: data,
            complete: function(){
                $('body').loading('stop');
            },
            success: function(response){
                if(response.code === 0){
                    createList(response.list);
                    createNav(response.total);
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

    var loadPage = function(){
        window.location.href = getListUrl();
    };

    $('#keyword').change(function(){
        var keyword = $(this).val().trim();
        if(keyword !== currentKeyword){
            currentKeyword = keyword;
            currentPage = 0;

            loadPage();
        }
    });

    $(".main-exit").click(function(){
        $('body').loading({message: '正在退出...'});

        $.ajax({
            type: 'GET',
            url: '/api/logout',
            complete: function(){
                window.location.href = '/';
            }
        });
    });

    queryPatient();
});