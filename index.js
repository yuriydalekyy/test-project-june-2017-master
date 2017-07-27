"use strict";

/**
 * Функция для конвертации строк из GET запросов в запрос к ElasticSearch
 * @param {String} queryString
 * @returns {{}}
 * model.id[0].not
 */
module.exports = function QSToES (queryString) {
  
  let mas = queryString.split("&");
  let objParam = [];
  let suf, ind, value, param,flag, group=[], flagGroup, maxIndex=0;
  let request={"query":{
    "bool":{
    }
  }};
  /*Визначення всіх параметрів*/
  mas.forEach(function (item) {
    value = item.split("=")[1]; //Значення
    param = item.split("=")[0]; //Параметр
    if(param!=="group") {

        /*Суфікс*/
        suf = param.substr(param.length - 3);
        if (suf == "not" || suf == "gte" || suf == "lte") {
            param = param.substr(0, param.length - 4);
        }
        else {
            suf = undefined;
        }

        /*Індекс*/
        ind = param.split(/\[|\]/)[1];
        if(ind>maxIndex) maxIndex=ind;
        if (ind) {
            param = param.substr(0, param.length - ind.length - 2)
        }
        objParam.push({param, ind, suf, value});  //масив об'єктів з параметрами
    } else{
        group = value.split(","); //помічаєм групові параметри
    }
  });

  objParam.forEach(function (item) {
      console.log(JSON.stringify(item)+ "-----")
      flagGroup=0;
      for(let i=0; i<group.length; i++){
          if(item.param==group[i]) flagGroup=1;
      }
      if(flagGroup){
        switch (item.suf){
            case undefined:
                console.log("must")
                if (!("must" in request.query.bool)) {
                    request.query.bool["must"] = [];
                }
                if(item.ind==undefined) item.ind=0;
                if (request.query.bool.must[item.ind] == undefined) {
                    request.query.bool["must"][item.ind]={"bool":{"must":[]}};
                }
                request.query.bool.must[item.ind].bool.must.push({"term": {[item.param]: {"value": item.value}}});
                break;

            case "not":
                console.log("must_not")
                if (!("must_not" in request.query.bool)) {
                    request.query.bool["must_not"] = [];
                }
                if(item.ind==undefined) item.ind=0;
                if (request.query.bool.must_not[item.ind] == undefined) {
                    request.query.bool["must_not"][item.ind]={"bool":{"must":[]}};
                }
                request.query.bool.must_not[item.ind].bool.must.push({"term": {[item.param]: {"value": item.value}}});
                break;


            default:
        }
      }
  })


  objParam.forEach(function (item) {
      flagGroup=0;
      for(let i=0; i<group.length; i++){
        if(item.param==group[i]) flagGroup=1;
    }
      if(!flagGroup) {
          switch (item.suf) {
              case undefined:
                  if (!("must" in request.query.bool)) {
                      request.query.bool["must"] = [];
                  }
                  request.query.bool["must"].push({"term": {[item.param]: {"value": item.value}}});
                  break;
              case "not":
                  if (!("must_not" in request.query.bool)) {
                      request.query.bool["must_not"] = [];
                  }
                  request.query.bool["must_not"].push({"term": {[item.param]: {"value": item.value}}})
                  break;
              case "lte":
                  if (!("must" in request.query.bool)) {
                      request.query.bool["must"] = [];
                  }
                  flag = 0;
                  request.query.bool.must.forEach(function (itemRange, i) {
                      if(itemRange.range!==undefined) {
                          if (item.param in itemRange.range) {
                              request.query.bool["must"][i]["range"][item.param][item.suf] = item.value;
                              flag = 1;
                          }
                      }
                  });
                  if (!flag) {
                      request.query.bool["must"].push({"range": {[item.param]: {[item.suf]: item.value}}});
                  }
                  break;
              case "gte":
                  if (!("must" in request.query.bool)) {
                      request.query.bool["must"] = [];
                  }
                  flag = 0;
                  request.query.bool.must.forEach(function (itemRange, i) {
                      if(itemRange.range!==undefined) {
                          if (item.param in itemRange.range) {
                              request.query.bool["must"][i]["range"][item.param][item.suf] = item.value;
                              flag = 1;
                          }
                      }
                  });
                  if (!flag) {
                      request.query.bool["must"].push({"range": {[item.param]: {[item.suf]: item.value}}});
                  }
                  break;
              default:
          }
      }
  });

  /*Чистка масива від елементів undefined*/
    if("must" in request.query.bool){
        for(let i=0;i<request.query.bool.must.length;i++){
            if(request.query.bool.must[i]==undefined) {request.query.bool.must.splice(i,1)}
        }

    }
    if("must_not" in request.query.bool){
        for(let i=0;i<request.query.bool.must.length;i++){
            if(request.query.bool.must[i]==undefined) {request.query.bool.must.splice(i,1)}
        }

    }
  return request;
};
