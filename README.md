# cplotter-validator

Does several object validations. This was inspired by Laravel Validation

---

**Table of Contents**

[TOC]

---
#Dependencies
- dotenv-safe
- email-validator
- sequelize
- validar-cpf
---
# Instalation
`npm install cplotter-validator -s`
---
## Configure app
### Configure dotenv-safe in your project
Make the following files in the root folder of your project.
- .env.example
- .env

copy this to the two files created:

    USERDB=
    PASSWORDDB=
    DATABASE=
    HOSTDB=
    DIALECTDB=

Fill the .env file with the following data:



    USERDB= "database's user"
    PASSWORDDB= "database user's password"
    DATABASE= "database name"
    HOSTDB= "adrress of database"
    DIALICTDB= "mysql|mariadb|sqlite|postgres|mssql"


### Configure sequelize in your project
See more details about sequelize in:
https://sequelize.org/master/manual/getting-started

You can configure your sequelize to use the .env  variables, but is optional.

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
		unique:["<table>:<optional_field>:<optional_value>","column","message"] // OPTIONAL
		minLength:[number,"message"] // OPTIONAL
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
	- email - verify if value is a valid e-mail.
	- cpf - verify if value is a brazilian CPF.
	- boolean - verify if a value is a boolean.
- message is the message tha will added on return if the property value is not compatible with type.

### unique[]
This property is optional.
Verify in database if value of property (seted in param property) is unique.
This property receive a array as value, this array have must respect the following structure:
`[tabe,table_column,message]`
- table - set the table name for search and a role to exclude register of search
- table_column - set column for search value
- message is the message tha will added on return if the property value exists in database.
**Excluding registers from search**
Sometimes it is necessary to exclude some records from the search to ensure perfect validation. When necessary, you can use a special string in the table parameter.

`**"users: id:10"**`

where:
- users -  is name of table
- id - is column of table
- 10 - is value will be exclude of search

ex:

    [
    	{
    		param:"email"
    		unique:["users: id:1","mail","E-mail alread exists."]
    	}
    ]
This will generate a sql query like this:
`select count(*) from users where mail="tagetObject.email" and id !=1`

### minLength[]
This property is optional.
Verify if length of value of property (seted in param property) contains the minimum of caracters according to the rule .
This property receive a array as value, this array have must respect the following structure:
`[number,message]`
- number - must be a integer value
- message - is the message tha will added on return if the property value is not compatible with the role.