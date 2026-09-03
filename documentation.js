const swagger = require ('swagger-jsdoc')
const options = {
    definition : {
        openapi:'3.0.0',
        info:{
            title:'hedgeNest App',
            version:'1.0.0',
            description:'swagger documentaion'
        },
        servers:[
            {
                url: "/",
                description: 'Current host'
            },
            {
                url: `http://localhost:${process.env.PORT || 3333}`,
                description: 'Localhost route'
            },
            {
                url: "https://hedgenest.onrender.com",
                description: 'The hosted route'
            },
        ],
        components: {
        securitySchemes:{
            bearerAuth:{
                type: 'http',
                scheme: 'bearer',
                bearerformat:'JWT'
            }
        }
    }

    },
    apis: [
        "./docs/users.yaml","./docs/bank.yaml","./docs/kyc.yaml","./docs/payment.yaml", "./docs/conversion.yaml","./docs/smartSave.yaml","./docs/admin.yaml", "./docs/investmentPlan.yaml","./docs/investment.yaml", "./docs/waitlist.yaml"
    ],
}

module.exports = swagger(options)
