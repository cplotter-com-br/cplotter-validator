const express = require("express")
const mailValidator = require("email-validator");
const validarCpf = require('validar-cpf');
const Sequelize=require("sequelize")
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
        //UNIQUE
        valida=await uniqueValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //MINLENGTH
        valida=minLengthValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //EXISTS
        valida=await existsValidation(vlg,body)
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
        body[validationRole.param]==null || 
        body[validationRole.param]=='')){
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
            validado=mailValidator.validate(body[validationRole.param])
            break
        case "cpf":
            validado=validarCpf(body[validationRole.param])
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

    }
    if(validado)
        return
    return validationRole.type[1]
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
    if(count[0]["count"]>0)
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