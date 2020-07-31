const express = require("express")
const mailValidator = require("email-validator");
const validarCpf = require('validar-cpf');
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
        //MAXLENGTH
        valida=maxLengthValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //MIN
        valida=minValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //MAX
        valida=maxValidation(vlg,body)
        if(valida)
            retorno.push(valida)
        //EQUAL
        valida=equalValidation(vlg,body)
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
        case "array":
            if(!Array.isArray(body[validationRole.param])){
                validado=false
            }
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

function minLengthValidation(validationRole,body){
    if(!validationRole.minLength || !body[validationRole.param])
        return
    if(body[validationRole.param].length<validationRole.minLength[0])
        return validationRole.minLength[1]
    return
}
function maxLengthValidation(validationRole,body){
    if(!validationRole.maxLength || !body[validationRole.param])
        return
    if(body[validationRole.param].length<validationRole.maxLength[0])
        return validationRole.maxLength[1]
    return
}
function lengthValidation(validationRole,body){
    if(!validationRole.length || !body[validationRole.param])
        return
    if(body[validationRole.param].length<validationRole.length[0])
        return validationRole.length[1]
    return
}
function minValidation(validationRole,body){
    if(!validationRole.min || !body[validationRole.param])
        return
    if(body[validationRole.param]<validationRole.min[0])
        return validationRole.min[1]
    return
}
function maxValidation(validationRole,body){
    if(!validationRole.max || !body[validationRole.param])
        return
    if(body[validationRole.param]>validationRole.max[0])
        return validationRole.max[1]
    return
}
function equalValidation(validationRole,body){
    if(!validationRole.equal || !body[validationRole.param])
        return
    if(body[validationRole.param]===validationRole.equal[0])
        return validationRole.equal[1]
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