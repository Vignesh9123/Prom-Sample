const express = require('express')
import type { NextFunction, Request, Response } from 'express'
import promClient from 'prom-client'
const app = express()



const requestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});


const reqMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    res.on('finish', () => {
        requestCounter.inc({
            method: req.method,
            route: req.route? req.route.path: req.route,
            status_code: res.statusCode
    })
})

next()
}

app.use(reqMiddleware)

app.get("/metrics", async(req: Request, res: Response)=>{
    console.log("Metrics endpoint hit")
    const metrics = await promClient.register.metrics()
    console.log("Metrics", metrics)
    res.json({message: "Sample metrics"})

})


app.listen(3000, ()=>{console.log("Server in running")})


