const express = require('express')
import type { NextFunction, Request, Response } from 'express'
import promClient from 'prom-client'
const app = express()

export const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000] // Define your own buckets here
});


const requestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});


const reqMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const start = Date.now();
    res.on('finish', () => {
        requestCounter.inc({
            method: req.method,
            route: req.route? req.route.path: req.route,
            status_code: res.statusCode
    })
    httpRequestDurationMicroseconds.observe({
        method: req.method,
        route: req.route ? req.route.path : req.path,
        code: res.statusCode,
        
    }, Date.now() - start);
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


