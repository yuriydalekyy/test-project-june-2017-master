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
  let suf, ind, value, param;
  let request={"query":{
    "bool":{
    }
  }};
  mas.forEach(function (item) {
    value = item.split("=")[1];
    param = item.split("=")[0];

    suf = param.substr(param.length-3);
    if(suf =="not"||suf=="gte"||suf=="lte"){
    param = param.substr(0, param.length-4);
    }
    else {
      suf = undefined;
    }
    ind = param.split(/\[|\]/)[1];
    if(ind){
      param = param.substr(0, param.length - ind.length-2)
    }

    objParam.push({param, ind,suf,value});

  });

  objParam.forEach(function (item,i) {
     switch (item.suf){
         case undefined:
          if(!("must" in request.query.bool)){
            request.query.bool["must"]=[];
          }
           request.query.bool["must"].push({"term":{item}});
           break;
         default:
               console.log(2222);
     }


  });

  return request.query.bool;
};
