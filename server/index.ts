

//?    db    88""Yb 88    88  88 88 88""Yb 88""Yb 88 8888b.     888888 Yb  dP 88""Yb 88""Yb 888888 .dP"Y8 .dP"Y8 
//?   dPYb   88__dP 88    88  88 88 88__dP 88__dP 88  8I  Yb    88__    YbdP  88__dP 88__dP 88__   `Ybo." `Ybo." 
//?  dP__Yb  88"""  88    888888 88 88""Yb 88"Yb  88  8I  dY    88""    dPYb  88"""  88"Yb  88""   o.`Y8b o.`Y8b 
//? dP""""Yb 88     88    88  88 88 88oodP 88  Yb 88 888888     888888 dP  Yb 88     88  Yb 888888 8bodP' 8bodP'
// todo :::::::::::::::::::::: Created at 22 - 10 - 2026 :::::::::::::::::::::::::::::::::::::::::::::::::::::::


import app from './app.js'
import { startUp } from './configs/database.js'
import envConfig from './configs/envConfig.js'

const message =`Server is listening on port ${envConfig.Port}\nServer in ${envConfig.Status}\nEverything is allright!!`
async function serverBootstrap(){
  try{
    await startUp()
    app.listen(envConfig.Port,() => {
      console.log(message)})
  }catch(error){
    console.error('Error initializing server: ',error)
    process.exit(1)
  }
}
serverBootstrap()