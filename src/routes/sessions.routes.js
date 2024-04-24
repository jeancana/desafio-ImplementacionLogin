import { Router } from 'express'
import { UsersController } from '../controllers/user.controller.mdb.js'


const router = Router()
const userController = new UsersController()

// **** Middleware de autorización de un Usuario con ROLE de admin ****
// En este caso, si el usuario es admin, llamanos a next, caso contrario
// devolvemos un error 403 (Forbidden), no se puede acceder al recurso.
// Si ni siquiera se dispone de req.session.user, directamente devolvemos error
// de no autorizado.
const auth = (req, res, next) => {

    try {
        // Autenticamos que el objeto user este autozido
        if (req.session.user) {

            // Al ser un usuario valido verificamos si su rol es Admin
            if (req.session.user.role == 'admin') {

                next()

                // Sino esta Autorizado Admin devolvemos el siguiente mensaje
            } else {

                res.status(403).send({ status: 'ERR', data: 'Usuario NO ES admin' })

            }

            // Sino estra Autenticado devolvemos el siguiente mensaje 
        } else {

            res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' })

        }

    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
}


// 1) Endpoint para AUTENTICAR y activiar la Session de UN Usuario "login" 
// IMPORTANTE: Los Datos de Usuario estan llegando a la ruta via POST desde la plantilla "login.handlebars"
router.post('/login', async (req, res) => {

    //console.log(req.body) // Para verificar todo lo que esta llegando la peticion POST

    // Verificando el estado el Objeto session 
    //console.log(req.session)

    try {

        // Desestructuramos lo que viene en el body via post
        // Recuperamos del body los datos de usuario ingresados,
        const { email, pass } = req.body
        //console.log(email)

        // Buscando en la BD si existe un usario con el email pasado por el cliente
        const userInDB = await userController.getByEmail(email)
        //console.log(user)
        //console.log(user.email)
        //console.log(user.password)

        // Validacion BASICA que me permite crear la sesion de usario
        // Nota: Esto va a evolucionar a una forma encryptada 
        if (userInDB !== null && pass === userInDB.password) {

            // Fundamental!!!: los datos de req.session se almacenan en SERVIDOR, NO en navegador.
            // IMPORTANTE : el objeto "user" se mantendrá(persistirá) entre
            // distintas solicitudes del navegador, hasta que la sesión expire o la destruyamos.

            // aca estoy creando dentro del req.session el objeto "user"
            // - Le asigno al objeto "user":
            // 1) los datos de User que vienen del body 
            // 2) Le Asgino un ROL de admin 
            req.session.user = { username: userInDB.email, role: 'usuario' } // forma de hacerlo
            //console.log('test-role', req.session.user.role) // Para verificar que se agrego el objeto user

            // Validando Si el usuario tiene role de Admin o NO
            if (userInDB.email === 'adminCoder@gmail' && userInDB.password === 'adminCod3r123') {
                req.session.user.role = 'admin'
            }

            console.log(req.session)

            // Forma1: Evitar el delay en actualizacion del req.session - Redireccion a la vista /products
            /* setTimeout(() => {
                res.redirect('/products')
            }, 200); */

            // Forma2 : Evitar el delay en actualizacion del req.session - Redireccion a la vista /products
            // Usando La función save() proporcionada por express-session
            // Aseguras que los cambios realizados en la sesión del usuario se guarden de manera persistente ntes de redirigir al usuario a otra página
            req.session.save(() => {
                res.redirect('/products')
            })
            
        } else {

            // OJO aca se hace un render y no un redirect 
            // Como no se pudo loguear bien vuelve a renderizar la vista "/login"
            res.render('login', {})

        }


    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/sessions/login 

    // Nota: Ruta para INICIAR LA sesion UN usurio con AUTENTICACION DE "user" y "password" desde CERO 

})


// 2) Endpoint Cerrar la Session/destruir de UN Usuario "login"
router.get('/logout', async (req, res) => {

    //console.log(req.session) // Para verificar todo lo que esta llegando la req.session

    try {

        // req.session.destroy nos permite destruir la sesión
        // De esta forma, en la próxima solicitud desde ese mismo navegador, se iniciará
        // desde cero, creando una nueva sesión y volviendo a almacenar los datos deseados.
        // .destroy requiere que se le pase un callback (err) =>{} para poder ejecutarse

        // IMPORTANTE: No es necesario hacer Nada mas xq el Modulo de session identifica que esta cerrando la session de este un usuario en especifico y en caso de hacer un error en el CERRADO lo reporta el mismo 
        req.session.destroy((err) => {

            // Si existe un error en proceso de logout lo reporto 
            if (err) {

                res.status(500).send({ status: 'ERR', data: err.message })

                // Sino devuelvo el mensaje exitoso
            } else {

                // Respuesta vieja 
                //res.status(200).send({ status: 'OK', data: 'Sesión finalizada' })

                // Al cerrar la session redirecciono a la "/login"
                res.redirect("/login")

            }
        })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/sessions/logout

    // Nota: esta ruta se una para LIMPIAR LA sesion INICIAZADO con la ruta http://localhost:5000/api/sessions
    // Y ARRANCA todo desde CERO NUEVAMENTE
})


// 3) Endpoint "privado", solo visible para un Usuario con Role de "admin".
router.get('/admin', auth, async (req, res) => {

    console.log(req.session) // Para verificar todo lo que esta llegando al req.session

    try {
        res.redirect('/profile')

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/sessions/admin
})



export default router