const express = require("express")
const Request = require("request-promise-native");
/**
* @param {Array} validationRoles
* @param {Object} obj
*/
module.exports.validate=async (validationRoles,obj)=>{
    const vl=validationRoles
    const body=obj
    let retorno=[]
    for(let x=0;x<vl.length;x++){
        vlg=vl[x];
        //REQUIRED
        let valida=required(vlg,body)
        if(valida){
            retorno.push(valida)
            continue
        }
        //TYPE
        valida=await typeValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //MINLENGTH
        valida=minLengthValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //LENGTH
        valida=lengthValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //MIN
        valida=minValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //inList
        valida=inListValidation(vlg,body)
        if(valida)
            retorno.push(valida)
    }
    if(retorno.length<1) return false
    return {validation:retorno}
}

function required(validationRole,body){
    if(validationRole.required && 
        validationRole.required[0]==="required" && 
        (typeof body[validationRole.param]==="undefined" || 
        body[validationRole.param]===null || 
        body[validationRole.param]==='')){
        return validationRole.required[1]
    }
    return
}

async function typeValidation(validationRole,body){
    if(!validationRole.type || typeof body[validationRole.param]==="undefined")
        return
    let validado=true
    switch(validationRole.type[0]){
        case "email":
            validado=validaEmail(body[validationRole.param])
            break
        case "cpf":
            validado=validaCpf(body[validationRole.param])
            break
        case "cnpj":
            validado=validaCnpj(body[validationRole.param])
            break
        case "doc":
            if(!validaCnpj(body[validationRole.param]) && !validaCpf(body[validationRole.param]) )
                validado=false
            break
        case "boolean":
            if(typeof(body[validationRole.param])!== "boolean" && 
                body[validationRole.param]!==0 && 
                body[validationRole.param]!==1){
                validado=false
            }
            break
        case "integer":
            validado=Number.isInteger(body[validationRole.param])
            break
        case "cep":
            if(body[validationRole.param].length!=9){
                validado=false
                break
            }
            if(validationRole.type[2] && validationRole===true)
                validado= await consultaCep(body[validationRole.param])
            break
        case "number":
            if(isNaN(body[validationRole.param]))
                validado=validationRole[1]
            break

    }
    if(validado)
        return
    return validationRole.type[1]
}

function minValidation(validationRole,body){
    if(!validationRole.min || !body[validationRole.param] || isNaN(validationRole.min[0]))
        return
    if(body[validationRole.param]<validationRole.min[0])
        return validationRole.min[1]
    return
}
function inListValidation(validationRole,body){
    if(!validationRole.inLIst || !body)
        return
    const lista=validationRole.inLIst[0]
    for(let x=0;x<lista.length;x++){
        if(lista[x]==body[validationRole.param])
            return
    }
    return validationRole.inList[1]
}

async function existsValidation(validationRole,body){
    if(!validationRole.exists || !body[validationRole.param])
        return
    const env=process.env
    const sequelize=new Sequelize(env.DATABASE,env.USERDB,env.PASSWORDDB,{
            host:env.HOSTDB,
            dialect:env.DIALECTDB
        }
    )
    const queryParams=validationRole.exists[0].split(":")
    let query="select count(*) as count from "+queryParams[0]+" where "+validationRole.exists[1]+" = '"+body[validationRole.param]+"'"
    const count=await sequelize.query(query,{type:Sequelize.QueryTypes.SELECT})
    sequelize.close()
    if(count[0]["count"]<1)
        return validationRole.exists[2]
    return
}

async function uniqueValidation (validationRole,body){
    if(!validationRole.unique || !body[validationRole.param])
        return
    const env=process.env
    const sequelize=new Sequelize(env.DATABASE,env.USERDB,env.PASSWORDDB,{
            host:env.HOSTDB,
            dialect:env.DIALECTDB
        }
    )
    const queryParams=validationRole.unique[0].split(":")
    let query="select count(*) as count from "+queryParams[0]+" where "+validationRole.unique[1]+" = '"+body[validationRole.param]+"'"
    if(queryParams.length>1)
        query+=" and "+queryParams[1]+" != "+queryParams[2]
    const count=await sequelize.query(query,{type:Sequelize.QueryTypes.SELECT})
    sequelize.close()
    if(count[0]["count"]>0 || count.count>0)
        return validationRole.unique[2]
    return
}

function minLengthValidation(validationRole,body){
    if(!validationRole.minLength || !body[validationRole.param])
        return
    if(body[validationRole.param].length<validationRole.minLength[0])
        return validationRole.minLength[1]
    return
}

function lengthValidation(validationRole,body){
    if(!validationRole.minLength || !body[validationRole.param])
        return
    if(body[validationRole.param].length!=validationRole.minLength[0])
        return validationRole.minLength[1]
    return
}

async function consultaCep(cep){
    try{
        const req={
            uri:"https://api.postmon.com.br/v1/cep/"+cep,
            json: true
        }
        const retorno=await Request.get(req)
        if(!retorno|| !retorno.cidade)
            return false
        return true

    }catch(error){
        return false
    }    
}

function validaCnpj(cnpj){
    if (cnpj.length != 14)
        return false;
    if(isNaN(cnpj))
        return false;
    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" || 
        cnpj == "11111111111111" || 
        cnpj == "22222222222222" || 
        cnpj == "33333333333333" || 
        cnpj == "44444444444444" || 
        cnpj == "55555555555555" || 
        cnpj == "66666666666666" || 
        cnpj == "77777777777777" || 
        cnpj == "88888888888888" || 
        cnpj == "99999999999999")
        return false;
    // Valida DVs
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0,tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
          return false;
    return true;
}

function validaCpf(cpf){
    var numeros, digitos, soma, i, resultado, digitos_iguais;
    digitos_iguais = 1;
    if (cpf.length < 11)
        return false;
    for (i = 0; i < cpf.length - 1; i++)
        if (cpf.charAt(i) != cpf.charAt(i + 1))
            {
                digitos_iguais = 0;
                break;
            }
    if (!digitos_iguais)
          {
          numeros = cpf.substring(0,9);
          digitos = cpf.substring(9);
          soma = 0;
          for (i = 10; i > 1; i--)
                soma += numeros.charAt(10 - i) * i;
          resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
          if (resultado != digitos.charAt(0))
                return false;
          numeros = cpf.substring(0,10);
          soma = 0;
          for (i = 11; i > 1; i--)
                soma += numeros.charAt(11 - i) * i;
          resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
          if (resultado != digitos.charAt(1))
                return false;
          return true;
          }
    else
        return false;
}

function validaEmail(email){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}