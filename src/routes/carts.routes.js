
// ************* PAQUETE DE RUTAS PARA LA API DE Carritos (api/carts) ********************

// Aca vamos a Preparar el CRUD para las rutas del Archivo carts.routes.js

// Vamos a Tener 5 rutas para manejar carts: 
// 1) Crear un cart en la BD
// 2) Leer/Consultar todos los carts de la BD 
// 3) Leer/Consultar un(1) cart de la BD 
// 4) Actualizar un(1) cart de la BD
// 5) Borrar un(1) cart de la BD

// ********* C.R.U.D DE Carritos ************

// 3 Pasos basicos para Intregar y Poder Usar carts.controllers.mdb.js EN carts.routes.js 
// Paso Nro1: importar el controlador
// Paso Nro2: Generar un nueva Instancia del controlador
// Paso Nro3: Usar los Metodo importados de la carpeta Controller que Necesite

import { Router } from 'express'

//Paso 1: Importando la clase products.controllers.mdb.js  
// Esta Importacion funciona para: Persistencia de Archivos con MongoDB
// Estamos importando la Clase que CartControlle contiene los metodos
import { CartController } from '../controllers/cart.controller.mdb.js'
import Product from '../models/Product.model.js'
import Cart from '../models/Cart.model.js'

const router = Router()

// Paso 2: Generando una nueva Intanscia - Persistencia de Archivos con MongoDB
const controller = new CartController()

// ******** CREANDO el C.R.U.D y Usanso los Metodos Importados del Archivo cart.controller.mdb.js  *************

// Nota: Fortalecimos el Codigo agregando try/catch en todas las rutas y respetamos los codigos de Estado

// *** 1.1) Read - Endpoint para leer/Consultar todos los Carritos Existentes en la DB - Con POSTMAN
router.get('/', async (req, res) => {

    try {

        // Aca Mandamos la respuesta al cliente con el listado de productos encontrados en BD
        res.status(200).send({ status: 'OK. Mostrando Listado de Carritos', data: await controller.getCarts() })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }
})


// *** 1.2) Read - Endpoint para leer/Consultar Un(1) Carrito por su ID en BD - Con POSTMAN
router.get('/:cid', async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { cid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID)  
        console.log(cid)

        // Paso 3: Usando el Metodo .getCartById() disponible en archivo cart.controller.mdb.js
        const result = await controller.getCartById(cid)

        // Aca Mandamos la respuesta al cliente con el Carrito encontrado 
        res.status(200).send({ status: 'Ok. Mostrando Carrito Selecionado ', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/api/carts/65ba888487d6c36549545995

}) 


// *** 2) Create - Endpoint para Crear un Nuevo Carrito de productos Vacio o Con productos- Con POSTMAN  
router.post('/', async (req, res) => {
    
    //console.log(req.body)// Verificando lo que viene por el body
    
    const products = req.body // Asignando lo que viene por body a una constante
    //console.log(products, Array.isArray(products))

    // Verificamos y sino mandan nada por el Body Creamos un carrito vacio 
    if (!Array.isArray(products)) {

        try {

            const newContent = {
                products: [ ]
            }

            const result = await controller.addCart( newContent )

            return res.status(200).send({ status: 'ok - carrito vacio', data: result })

        } catch (err) {

            res.status(500).send({ status: 'ERR', data: err.message })

        }

    } else { 

        // Validando los Datos Antes de Crear el carrito los ID's y Cantidad del Producto    
        if (products && Array.isArray(products)) {

            for (let i = 0; i < products.length; i++) {
                const { producto, cantidad } = products[i]

                // Validate product
                try {
                    const product = await Product.findById(producto)
                    
                    // Validate positive quantity
                    if (cantidad < 1) {
                        return res.status(400).send({ status: 'BAD REQUEST', data: `Cantidad must be greater than 1` })
                    }

                    if (cantidad > product.stock) {
                        return res.status(400).send({ status: 'BAD REQUEST', data: `Cantidad must be less than ${product.stock}` })
                    }
                } catch {
                    return res.status(400).send({ status: 'BAD REQUEST', data: `Product ID not found: ${producto}` })
                }
            }
            
            try {

                // Paso 3: Usando el Metodo .addProduct() disponible en archivo product.controller.mdb.js

                const result = await controller.addCart({ products })

                // Aca Mandamos la respuesta al cliente
                return res.status(200).send({ status: 'OK. Carrito Creado', data: result })

            } catch (err) {

                res.status(500).send({ status: 'ERR', data: err.message })

            }
        }


    }
    
})


// *** 3) Update - Endpoint par Agregar/Actualizar los productos a un Carrito en la DB - Con POSTMAN
router.put('/:cid', async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { cid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) 
        console.log(cid)

        const cart = await controller.getCartById(cid, false)
        if (!cart) return res.status(400).send({ status: 'ERR', data: 'Carrito no existe' })

        // Desestructuramos el req.body 
        const products = req.body
        // Verificamos y Validamos los valores recibidos
        if (!products || !Array.isArray(products)) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
        }

        const newPids = products.map((e) => e.producto)
        const filteredCartProducts = [...cart.products].filter((e) => !newPids.includes(e.producto.toString()))
        const updatedProducts = [
            ...filteredCartProducts.map((e) => ({ producto: e.producto.toString(), cantidad: e.cantidad })),
            ...products,
        ]


        // IMPORTANTE: Aca tenemos un else{} intrinsico por la lectura en cascada 

        // Verificando que esta dentro de newContent
        //console.log(newContent)
        
        // Paso 3: Usando el Metodo .updateCart() disponible en archivo product.controller.mdb.js
        await controller.updateCart(cid, {
            products: updatedProducts
        })

        const result = await controller.getCartById(cid, false)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. Product Updated', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})


// *** 4) Delete - Borrando todo los Productos del Carrito (dejando el carrito vacio) de la DB - Con POSTMAN
router.delete("/:cid", async (req, res) => {

    try {

        // Asignamos a id el ID que nos llega req.params
        const { cid } = req.params
    
        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID) 
        console.log(cid)

        const newContent = {

            products: [],
            total: ' '

        }

        // Paso 3: Usando el Metodo .deleteProductById() disponible en archivo product.controller.mdb.js
        const result = await controller.updateCart(cid, newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: 'OK. Cart Deleted', data: result })

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }
})


// *** 5) Delete - Endpoint para Borra un Producto agregado al Carrito - Con POSTMAN
router.delete('/:cid/products/:pid', async (req, res) => {

    try {

        // Desestructuramos lo que nos llega req.params
        const { cid, pid } = req.params

        //IMPORTANTE: Aca verifico que solo le estoy pasando el valor(ID)
        console.log(cid)
        console.log(pid)

        // Verificamos y Validamos los valores recibidos
        if (!cid || !pid) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' })
        }

        // IMPORTANTE: Aca tenemos un else{} intrinsico por la lectura en cascada 

        // Usando el Metodo .getCartById() para encontar el carrito
        const cart = await controller.getCartById(cid) 

        // Desestructuramos el Carrito encontrado
        const {_id , products, total} = cart
        
        // Verificando el contenido de "products"
        console.log(typeof products)
        console.log(Array.isArray(products))// Verificando si es un Array 

      
        // Modificando Copia Profunda 
        const products2 = JSON.parse(JSON.stringify(products))

        // Eliminando un producto del carrito
        const deleteProductoOncart = products2.filter(item => item._id !== pid)
         
        // Creamos un Nuevo Array con los productos que NO fueron eliminados del carrito
        const newContent = {

            _id: _id,
            products: deleteProductoOncart,
            total: total

        }
        
        // Verificando el nuevo contenido del Array
        console.log(newContent)
        
        // Pisando el Carrito Viejo por uno nuevo con los productos que no fueron eliminados 
        const result = await controller.updateCart(cid, newContent)

        // Aca Mandamos la respuesta al cliente
        res.status(200).send({ status: `OK. Product Deleted On Cart ID: ${cid}`, data: result})

    } catch (err) {

        res.status(500).send({ status: 'ERR', data: err.message })

    }

})



export default router


/* 

import mongoose from 'mongoose'// Aca importamos la libreria para que el ejemplo de Parseo funcione - NO se necesita en el carts.routes

// ************ Esto es un metodo/FUNCION que dejo aca a para RECORDAR COMO SE HACE **********
// HACIENDO el Ejemplo: 

// MUY IMPORTANTE: convirtiendo el productoId recibido por req.params en un ObjectId de mongo

const idConvertir = '65b4cb05f97d913894568e78'

const parseId = (id) => {

    return new mongoose.Types.ObjectId(id)

 }

// Asi se ACTIVA EL METODO - le paso el ID y convierto
parseId(idConvertir)

// verificando el Id convertido - si es correto
console.log(parseId(idConvertir)) 
*/