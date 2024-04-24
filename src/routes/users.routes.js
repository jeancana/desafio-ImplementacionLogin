
// ************* PAQUETE DE RUTAS PARA LA API DE usuarioS (api/users) ********************

// Aca vamos a Preparar el CRUD para las rutas del Archivo users.routes.js

// Vamos a Tener 5 rutas para manejar users: 
// 1) Crear un user en la BD
// 2) Leer/Consultar todos los users de la BD 
// 3) Leer/Consultar un(1) user de la BD 
// 4) Actualizar un(1) user de la BD
// 5) Borrar un(1) user de la BD

// ********* C.R.U.D DE usuarioS ************

// 3 Pasos basicos para Intregar y Poder Usar users.controllers.mdb.js EN users.routes.js 
// Paso Nro1: importar el controlador
// Paso Nro2: Generar un nueva Instancia del controlador
// Paso Nro3: Usar los Metodo importados de la carpeta Controller que Necesite

import { Router } from 'express'

// Importamos el uploader para poder trabajar con Multer y subir archivos 
//import { uploader } from '../uploader.js' // Esta desactivada - No lo necesitamos por ahora)

//Paso 1: Importando la clase users.controllers.mdb.js  
// 1.1) Esta Importacion funciona para: Persistencia de Archivos con FILE SYSTEM 
// import { userControllerfs } from '../controllers/user.controller.fs.js' // (Esta desactivada - No lo usamos)

// 1.2) Esta Importacion funciona para: Persistencia de Archivos con MongoDB
// Estamos importando la Clase que UsersController contiene los metodos
import { UsersController } from '../controllers/user.controller.mdb.js' // para trabajar con Mongo


const router = Router()

// Paso 2: Generando una nueva Intanscia - Persistencia de Archivos con MongoDB
const userController = new UsersController()


// ***************** CREANDO el C.R.U.D *********************

// Nota: Fortalecimos el Codigo agregando try/catch en todas las rutas y respetamos los codigos de Estado

// *** 1.1) Read - Endpoint para leer/Consultar todos los Usuarios de la DB - Con POSTMAN
router.get('/', async (req, res) => {

    try {

        // Paso 3: Usando el Metodo .getUsers() disponible en archivo user.controller.mdb.js
        const users = await controller.getUsers()

        // Aca Mandamos la respuesta al cliente con el listado de usuarios encontrados 
        res.status(200).send({ status: 'Ok. Mostrando Lista de usuarios', data: users })

    } catch (err) {
        
        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/users 

})

// LO TUVE QUE DESACTIVAR PARA PODER HACER FUNCIONAR EL "paginated"
// *** 1.2) Read - Endpoint para leer/Consultar Un(1) usuario de la DB  por su ID - Con POSTMAN
/* router.get('/:id', async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.params
        const id = req.params

        // IMPORTANTE: Aca verifico lo que viene por req.params - Esta llegando un Objeto y necesito pasar un ID 
        console.log(id)

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) y no el Objeto completo 
        console.log(id.id)

        // Paso 3: Usando el Metodo .getUserById() disponible en archivo user.controller.mdb.js
        const user = await controller.getUserById(id.id)

        // Aca Mandamos la respuesta al cliente con el usuario encontrado 
        res.status(200).send({ status: 'Ok. Mostrando usuario Selecionado ', data: user })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/users/659eb40ac25c1d84751aca91

}) */


// *** 2) Create - Endpoint para Agregar un usuario y cargar Su Foto con Multer en la DB - Con POSTMAN  
router.post('/register', async (req, res) => {

    //console.log(req.body.firstName)

    try {
    
        // Desestructuramos el req.body (el JSON con los Datos a Actualizar)
        const {
            first_name,
            last_name,
            email,
            password,
        } = req.body

        // Verificando el estado de los RETORNO DEL user.controller.mdb.js
        // Desestructuramos lo retornado por user.controller.mdb.js
        const [errors, user] = await userController.addUser({
            first_name, last_name, email, password
        })

        //console.log(errors)
        // Caso 1: si el elemento errors llega con un campo true existe un error
        // Todos los campos del Obj Errors deben estar en False para que se pueda REGISTRAR EL USUARIO
        //console.log('OBJETO Errors:', errors)

        // Caso 2: si el elemento user NO LLEGA 'null' entonces me regresa el USUARIO REGISTRADO
        //console.log('OBJETO Usuario', user)

        // *** IMPORTANTE ***
        // Esta pieza de Codigo me permite reportar los Errores el formulario de Registro
        // Hace un redirect a la misma ruta http://localhost:5000/register
        // Encodea la respuesta enviada xq sino se ve en la url la respuesta con los campos
        // Se veria asi: http://localhost:5000/register?errors=%7B%22first_name%22:false,%22last_name%22:false,%22email%22:false,%22password%22:false,%22repeated%22:true%7D 
        if (errors) {

            // De esta manera que expuesta la respuesta en la consulta http
            //const b64error = JSON.stringify(errors)
            
            const b64error = btoa(JSON.stringify(errors)) //Encriptamos a respuesta  
            return res.redirect(`/register?errors=${b64error}`)

        }

        res.redirect('/login')
        
       
    }  catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})


// *** 3) Update - Endpoint para Actualizar un usuario en la DB - Con POSTMAN
router.put('/:id', async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.params
        const id = req.params

        // IMPORTANTE: Aca verifico lo que viene por req.params - Esta llegando un Objeto y necesito pasar un ID 
        console.log(id)

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) y no el Objeto completo 
        console.log(id.id)

        // Desestructuramos el req.body (el JSON con los Datos a Actualizar)
        const { firstName, lastName, email, gender } = req.body

        // Verificamos y Validamos los valores recibidos
        if (!firstName || !lastName || !email || !gender) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
        }

        // IMPORTANTE: Aca tenemos un else{} intrinsico por la lectura en cascada 

        // Creamos un Nuevo Objeto con los Datos Desestructurados
        const newContent = {

            firstName, //Se puede poner asi el Objeto y JS enviente que la propiedad Y el valor tienen el MISMO NOMBRE
            lastName,
            email,
            gender

        }

        // Paso 3: Usando el Metodo .updateuser() disponible en archivo user.controller.mdb.js
        const result = await controller.updateUser(id.id, newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. user Updated', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }


})


// *** 4) Delete - Borrando un usuario de la DB - Con POSTMAN
router.delete("/:id", async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.params)
        const id = req.params

        // IMPORTANTE: Aca verifico lo que viene por req.params - Esta llegando un Objeto y necesito pasar un ID 
        console.log(id)

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) y no el Objeto completo 
        console.log(id.id)

        // Paso 3: Usando el Metodo .deleteUserById() disponible en archivo user.controller.mdb.js
        const result = await controller.deleteUserById(id.id)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. user Deleted', data: result })

    }   catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }
})


// ***** RUTA PARA PAGINADO CON DATOS MAS SIMPLES *****
router.get('/test-paginated', async (req, res) => {
    
    try {

        const users = await controller.getUsersPaginated()
        
        res.status(200).send({ status: 'OK', data: users })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/users/test-paginated
    // Nota el resultado de la esta ruta la puedo pasar a un plantilla (html/handlebars), lo puede consumir un Frontend y con eso ARMAMOS LA BARRA DE PAGINACION / LINEA DE PAGINACION 

})



// ***** RUTA PARA PAGINADO CON DATOS MAS DINAMICOS *****
// Podemos modificar el método getUsersPaginated() del controlador
// para recibir parámetros que obtengamos aquí mediante req.params o req.query
router.get('/test-paginated2', async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.query
        const pagineted = req.query

        // IMPORTANTE: Aca verifico lo que viene por req.quey - Esta llegando un Objeto y necesito pasar un ID 
        console.log(pagineted)

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) y no el Objeto completo 
        //console.log(pagineted.page)
        //console.log(pagineted.limit)
        

        const users = await controller.getUsersPaginated2(pagineted.page, pagineted.limit)

        res.status(200).send({ status: 'OK', data: users })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar:
    // 1) http://localhost:5000/api/users/test-paginated2
    // 2) http://localhost:5000/api/users/test-paginated2?limit=5&page=1&sort=desc
    // 3) http://localhost:5000/api/users/test-paginated2?limit=50&page=1&sort=desc
    // 4) http://localhost:5000/api/users/test-paginated2?limit=100&page=2&sort=desc 
    // IMPORTAN: al usar el sort=desc MongoDB Ordena todo de Menor a Mayor por su _id(este es el asgigna mongoDB) AUTOMATICAMENTE SIN USAR NINGUN PARAMETRO 
    // Nota: el resultado de la esta ruta la puedo pasar a un plantilla (html/handlebars), lo puede consumir un Frontend y con eso ARMAMOS LA BARRA DE PAGINACION / LINEA DE PAGINACION 

})
export default router