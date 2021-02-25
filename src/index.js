const { default: axios } = require("axios")
const yup = require("yup")
const jwt = require("jsonwebtoken")

const V_LOGIN_API_ENDPOINT = "http://localhost:4001/api/v1"
const V_CHECKOUT_API_ENDPOINT = "http://localhost:4002/api/v1"


const SERVICES = {
    list: [ "V-Login", "V-Checkout"],
    endpoints: {
        "V-Login": V_LOGIN_API_ENDPOINT,
        "V-Checkout": V_CHECKOUT_API_ENDPOINT,
        create: {
            "V-Login": V_LOGIN_API_ENDPOINT + "/services",
            "V-Checkout": V_CHECKOUT_API_ENDPOINT + "/services" 
        },
    }
}


let _helpers = {
    _getServiceUser: {
        args_schema: yup.object().shape({
            token: yup.string().required()
        }),
        func: async args => {
            let { token } = args;
            let { service_type: type } = jwt.decode(token)
            let endpoint = SERVICES.endpoints[type] + "/services/auth"
            let res = await axios(endpoint, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            return res.data.data.user
        }
    }
}

let helpers = {}
let _helpers_keys = Object.keys(_helpers);
for (let x=0; x < _helpers_keys.length; x++){
    let _helpers_key = _helpers_keys[x];
    let { args_schema, func: _func } = _helpers[_helpers_key]
    let func = async args => {
        try {
            await args_schema.validate(args, { abortEarly: false, strict: true })
            return await _func(args)
        } catch (err) {
            throw new Error(`\n\nVoltox: Validation Error\n
${err.errors.map(x => `${_helpers_key.slice(1)}: ${x}\n`)}`)
        }
    }
    helpers[_helpers_key.slice(1)] = func
}

helpers.getServiceUser({
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2LCJzZXJ2aWNlSWQiOjEsInNlcnZpY2VfdHlwZSI6IlYtTG9naW4iLCJpYXQiOjE2MTQyNjg3MTl9.anaeJXoBVLA0i7-38aYlHnoasYo8l6ix34o3pO4eQ_Y"
}).then(d => console.log(d))

module.exports = helpers;