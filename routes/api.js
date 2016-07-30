/**
 * Created by lcg on 16/7/29.
 */

'use strict';

var router = require('express').Router();
var AV = require('leanengine');
var _ = require('lodash');
var Patient = AV.Object.extend('patient');
var Query = AV.Query

router.post('/login',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;

    if(_.isNull(username) || _.isUndefined(username) || _.isNull(password) || _.isUndefined(password)){
        return res.send({code: 10001,msg:'用户名或密码错误.'});
    }

    AV.User.logIn(username,password)
        .then(function(loginedUser){
            req.session.logined = true;
            return res.send({code:0,msg:''});
        })
        .catch(function(error){
            return res.send({code: 10001,msg:'用户名或密码错误.'});
        });
});

router.get('/logout',function(req,res,next){
    req.session.logined = false;
    return res.send({code:0,msg:''});
});

router.get('/list', function(req,res,next){
    if(!req.session.logined){
        return res.send({code:10003,msg:'未登录'});
    }

    var keyword = req.query.k;
    if(typeof (keyword) != 'undefined'){
        keyword = decodeURIComponent(keyword);
    }
    var pageSize = req.query.s ? req.query.s : 10;
    var pageNum = req.query.n ? req.query.n : 0;

    var queryString = 'select * from patient ';
    var queryCountString = 'select count(*) from patient ';
    var option = '';

    if(!_.isNull(keyword) && !_.isUndefined(keyword) && keyword.length > 0 ){
        option += "where name like '%" + keyword + "%' or ";
        option += "number like '%" + keyword + "%' or ";
        option += "sex like '%" + keyword + "%' or ";
        option += "age like '%" + keyword + "%'";

        queryString += option;
        queryCountString += option;
    }

    queryString += " limit " + (pageNum * pageSize) + "," + pageSize;

    AV.Promise.when(AV.Query.doCloudQuery(queryCountString),AV.Query.doCloudQuery(queryString))
        .then(function(total,list){
            return res.send({code:0,msg:'',total:total.count,list:list.results});
        })
        .catch(function(error){
            return res.send({code:10001,msg:'查询列表失败.'});
        });
});

router.get('/details', function(req,res,next){
    if(!req.session.logined){
        return res.send({code:10003,msg:'未登录'});
    }

    var pid = req.query.pid;

    if(_.isNull(pid) || _.isUndefined(pid)){
        return res.send({code:10002,msg:'缺少pid'});
    }

    var query = new AV.Query(Patient);
    query.get(pid)
        .then(function(patient){
            return res.send({code:0,msg:'',patient:patient});
        })
        .catch(function(error){
            return res.send({code:10001,msg:'查询失败.'});
        });
});


var checkPatient = function(req){
    var name = req.body.name;
    var number = req.body.number;
    var sex = req.body.sex;
    var age = req.body.age;
    var date = req.body.date;

    if(_.isNull(name) || _.isUndefined(name) ||
        _.isNull(number) || _.isUndefined(number) ||
        _.isNull(sex) || _.isUndefined(sex) ||
        _.isNull(age) || _.isUndefined(age) ||
        _.isNull(date) || _.isUndefined(date)){
        return false;
    }

    return true;
};

var savePatient = function(req,patient){
    patient = patient || new Patient();

    delete req.body.pid;

    for (var p in req.body){
        patient.set(p,req.body[p]);
    }

    return patient.save();
};

router.post('/add',function(req,res,next){
    if(!req.session.logined){
        return res.send({code:10003,msg:'未登录'});
    }

    if(!checkPatient(req)){
        return res.send({code:10001,msg:'参数错误.'});
    }

    savePatient(req)
        .then(function(patient){
            return res.send({code:0,msg:''});
        })
        .catch(function(error){
            return res.send({code:10001,msg:'添加失败'});
        })
});

router.post('/update',function(req,res,next){
    if(!req.session.logined){
        return res.send({code:10003,msg:'未登录'});
    }

    var pid = req.body.pid;

    if(_.isNull(pid) || _.isUndefined(pid) || !checkPatient(req)){
        return res.send({code:10001,msg:'参数错误.'});
    }

    var query = new AV.Query(Patient);
    query.get(pid)
        .then(function(patient){
            return savePatient(req,patient);
        })
        .then(function(patient){
            return res.send({code:0,msg:''});
        })
        .catch(function(error){
            return res.send({code:10001,msg:'更新失败'});
        })
});

router.get('/delete',function(req,res,next){
    if(!req.session.logined){
        return res.send({code:10003,msg:'未登录'});
    }

    var pid = req.query.pid;

    if(_.isNull(pid) || _.isUndefined(pid)){
        return res.send({code:10002,msg:'缺少pid'});
    }

    var query = new AV.Query(Patient);
    query.get(pid)
        .then(function(patient){
            return patient.destroy();
        })
        .then(function(){
            return res.send({code:0,msg:''});
        })
        .catch(function(error){
            return res.send({code:10001,msg:'查询失败.'});
        });
});


module.exports = router;