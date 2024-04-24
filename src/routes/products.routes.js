
// ************* PAQUETE DE RUTAS PARA LA API DE PRODUCTOS (api/products) ********************

// Aca vamos a Preparar el CRUD para las rutas del Archivo products.routes.js

// Vamos a Tener 5 rutas para manejar Productos: 
// 1) Crear un Producto en la BD
// 2) Leer/Consultar todos los Productos de la BD 
// 3) Leer/Consultar un(1) Producto de la BD 
// 4) Actualizar un(1) Producto de la BD
// 5) Borrar un(1) Producto de la BD

// ********* C.R.U.D DE PRODUCTOS ************

// 3 Pasos basicos para Intregar y Poder Usar products.controllers.mdb.js EN products.routes.js 
// Paso Nro1: importar el controlador
// Paso Nro2: Generar un nueva Instancia del controlador
// Paso Nro3: Usar los Metodos importados de la carpeta Controller que se Necesite

import { Router } from 'express'

// Importamos el uploader para poder trabajar con Multer y subir archivos 
import { uploader } from '../uploader.js'

// 1) Esta Importacion funciona para: Persistencia de Archivos con MongoDB
// Estamos importando la Clase que ProductsController contiene los metodos 
import { ProductsController } from '../controllers/product.controller.mdb.js' // para trabajar con Mongo

// Paso 2: Generando una nueva Intanscia aca del ProductsController - Persistencia de Archivos con MongoDB
const controller = new ProductsController()

// Inicializando el Router de Express
const router = Router()

// ******** CREANDO el C.R.U.D y Usanso los Metodos Importados del Archivo product.controller.mdb.js  *************

// Nota: Fortalecimos el Codigo agregando try/catch en todas las rutas y respetamos los codigos de Estado

// *** 1.1) Read - Endpoint para leer/Consultar todos los Productos de la DB - Con POSTMAN
router.get('/', async (req, res) => {

    try {

        // IMPORTANTE: Aca verifico lo que viene por req.quey - Esta llegando un Objeto y necesito pasar un ID 
        //console.log(req.query)

        // Asignamos a id el ID que nos llega req.query
        let { page, limit, sort , description } = req.query

        // Paso 3: Usando el Metodo .getProducts() disponible en archivo product.controller.mdb.js
        const products = await controller.getProducts(limit, page, sort, description)

        // Aca Mandamos la respuesta al cliente con el listado de productos encontrados 
        res.status(200).send({ status: 'Ok. Mostrando Lista de Productos', data: products })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar:
    // http://localhost:5000/api/products 
    // http://localhost:5000/api/products/?page=1&limit=5&sort=desc&description=fruta

})


// *** 1.2) Read - Endpoint para leer/Consultar Un(1) Producto de la DB  por su ID - Con POSTMAN
router.get('/:pid', async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { pid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) y no el Objeto completo 
        console.log(pid)

        // Paso 3: Usando el Metodo .getProductById() disponible en archivo product.controller.mdb.js
        const product = await controller.getProductById(pid)

        // Aca Mandamos la respuesta al cliente con el producto encontrado 
        res.status(200).send({ status: 'Ok. Mostrando Producto Selecionado ', data: product })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/products/65b407b51ffaba8bd5d82e71

})


// *** 2) Create - Endpoint para Agregar un Producto y cargar Imagenes con Multer en la DB - Con POSTMAN  
router.post('/', uploader.single('thumbnail'), async (req, res) => {

    try {

        // el req.file lo inyecta el uploader(multer) y al verificarlo si esta vacio NO sube la img y reporta el problema
        if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' })

        // Desestructuramos el req.body (el JSON con los Datos a Actualizar)
        const { title, description, price, code, stock } = req.body

        // Verificamos y Validamos los valores recibidos
        if (!title || !description || !price || !code || !stock) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
        }

        // IMPORTANTE: Aca tenemos un else{} intrinsico por la lectura en cascada 

        // Creamos un Nuevo Objeto con los Datos Desestructurados 
        const newContent = {

            title, //Se puede poner asi el Objeto y JS enviente que la propiedad Y el valor tienen el MISMO NOMBRE
            description,
            price,
            // el obj req.file está disponible porque estamos utilizando Multer como middleware,
            // mediante el objeto uploader que estamos importando e inyectando.
            thumbnail: `/static/img/${req.file.filename}`,
            code,
            stock

        }

        // Paso 3: Usando el Metodo .addProduct() disponible en archivo product.controller.mdb.js
        const result = await controller.addProduct(newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. Producto Creado', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})


// *** 3) Update - Endpoint para Actualizar un Producto en la DB - Con POSTMAN
router.put('/:pid', uploader.single('thumbnail'), async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { pid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) 
        console.log(pid)

        // el req.file lo inyecta el uploader(multer) y al verificarlo si esta vacio NO sube la img y reporta el problema
        // if (!req.file) return res.status(400).send({ status: 'FIL', data: 'No se pudo subir el archivo' })

        // Desestructuramos el req.body 
        const { title, description, price, code, stock } = req.body

        // Verificamos y Validamos los valores recibidos
        // if (!title || !description || !price || !code || !stock) {
        //     return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
        // }

        const product = controller.getProductById(pid)

        // IMPORTANTE: Aca tenemos un else{} intrinsico por la lectura en cascada 
        console.log(req.file)

        // Creamos un Nuevo Objeto con los Datos Desestructurados
        const newContent = {
            title: title ?? product.title,
            description: description ?? product.description,
            code: code ?? product.code,
            price: price ?? product.price,
            stock: stock ?? product.stock,
            thumbnail: req?.file?.filename ? `/static/img/${req.file.filename}` : product.thumbnail
        }

        // Paso 3: Usando el Metodo .updateProduct() disponible en archivo product.controller.mdb.js
        const result = await controller.updateProduct(pid, newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. Product Updated', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})


// *** 4) Delete - Borrando un Producto de la DB - Con POSTMAN
router.delete("/:pid", uploader.single('thumbnail'), async (req, res) => {

    try {

        // Desestructuramos el req.params 
        const { pid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) 
        console.log(pid)

        // Paso 3: Usando el Metodo .deleteProductById() disponible en archivo product.controller.mdb.js
        const result = await controller.deleteProductById(pid)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. Product Deleted', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }
})



export default router