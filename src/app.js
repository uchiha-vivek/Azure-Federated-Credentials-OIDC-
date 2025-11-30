import express from 'express'
import healthRoutes from './routes/healthRoutes.js'

const app= express()
app.use(express.json())

app.use('/api/health',healthRoutes)

app.get("/",function(req,res){
    res.send("Express app running on Azure App Service")
})

export default app
