# cplotter-validator

Does several object validations. This was inspired by Laravel Validation

# Instalation
`npm install cplotter-validator`
---
# Use
Add cplotter-validator dependence
`const cplotterValidator=require("cplotter-validator)`

Create a validation roles  like this:
    let validationRoles = [
    	{
    		param:"email",
    		required:["required","E-mail is required"]
    		type:["email","Invalid e-mail"]
    	}
    ]

Call validation function
    let validationErrors = await cplotterValidator.validate(validationRoles, req.body);
    if(validationErrors){
    	console.log(validationErrors) //Validation failed return a messages in array
    } else {
    	console.log("Validated")
    }

## the validate function validate(validationRoles[], targetObject{})
The function validate receive two parameters
- validationRoles
	- Array of validationRoles objects, this object set the roles to validation.
- targetObject
	- Object that will be validated according to validationRoles, this object can be any object like express.request.body, express.request.headers, express.request.params or any object, object target can have properties wtih others objects, but is not possible validate the child properties.

the function validate returns FALSE when validate is ok or returns an array of string with the messagens of role when validation failed

## Understanding validation roles
The cplotter-validation needs an array of object (validatorRoles), this objects need to respect the following structure.


    {
    	param:"param_name", // REQUIRED
    	required:["<command>","message"] // OPTIONAL
    	type:["<type>","message"]  // OPTIONAL
		length:[number,"message"] // OPTIONAL
		minLength:[number,"message"] // OPTIONAL
		maxLength:[number,"message"] // OPTIONAL
		min:[number,"message"] // OPTIONAL
		max:[number,"message"] // OPTIONAL
		equal:[any,"message"] //OPTIONAL
		inList:[["opt","opt2",3],"message"] //OPTIONAL
    }
### validatorRoles object definition
####param:String
Set the name of property will be validated on the target object, this property is required
###required:[]
This property is optional.
Set if property (seted in param property) is required in target object.
This property receive a array as value, this array have must respect the following structure:
`[command,message]`
- command must be "required"
- message is the message tha will added on return if the property not exists in target object

### type:[]
This property is optional.
Verify if value of property (seted in param property) is compatible with role.
This property receive a array as value, this array have must respect the following structure:
`[type,message]`
- type must be one of the these string:
	- boolean - verify if a value is a boolean.
	- cep - verify if value is a brazilian CEP.
	- cnpj - verify if value is a brazilian CNPJ.
	- cpf - verify if value is a brazilian CPF.
	- doc - verify if value is a brazilian CPF or CNPJ.
	- email - verify if value is a valid e-mail.
	- number - verify if value is a number.
	- integer - verify if value is a integer.
	- array - verify if value is a array.
- message is the message tha will added on return if the property value is not compatible with type.
### length[]
This property is optional.
Verify if length of value of property (seted in param property) contains the number of caracters according to the rule .
This property receive a array as value, this array have must respect the following structure:
`[number,message]`
- number - must be a integer value
- message - is the message tha will added on return if the property value is not compatible with the role.
### minLength[]
This property is optional.
Verify if length of value of property (seted in param property) contains the minimum of caracters according to the rule .
This property receive a array as value, this array have must respect the following structure:
`[number,message]`
- number - must be a integer value
- message - is the message tha will added on return if the property value is not compatible with the role.
### maxLength[]
This property is optional.
Verify if length of value of property (seted in param property) contains the maximum of caracters according to the rule .
This property receive a array as value, this array have must respect the following structure:
`[number,message]`
- number - must be a integer value
- message - is the message tha will added on return if the property value is not compatible with the role.

### min[]
This property is optional.
Verify if value of property (seted in param property) is greater than or equal to role.
This property receive a array as value, this array have must respect the following structure:
`[number,message]`
- number - must be a number value
- message - is the message tha will added on return if the property value is not compatible with the role.

### max[]
This property is optional.
Verify if value of property (seted in param property) is less than or equal to role.
This property receive a array as value, this array have must respect the following structure:
`[number,message]`
- number - must be a number value
- message - is the message tha will added on return if the property value is not compatible with the role.

### equal[]
This property is optional.
Verify if value of property (seted in param property) is equal to role.
This property receive a array as value, this array have must respect the following structure:
`[number,message]`
- number - must be a number value
- message - is the message tha will added on return if the property value is not compatible with the role.

### inList[]
This property is optional.
Verify if value of property (seted in param property) is in a list.
This property receive a array as value, this array have must respect the following structure:
`[[list],message]`
- [list] - must be a array
- message - is the message tha will added on return if the property value is not compatible with the role.

---

#Cplotter Team
- Walnei Antunes - walnei.antunes@gmail.com
- Willyan Antunes - willyan.dantunes@gmail.com
- Wallace Antunes - wallace.dantunes@gmail.com

http://cplotter.com.br
