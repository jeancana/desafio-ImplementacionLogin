import { Router } from 'express'
import { ProductsController } from '../controllers/product.controller.mdb.js'
import { CartController } from '../controllers/cart.controller.mdb.js'

const router = Router()
const prdController = new ProductsController()
const cartController = new CartController()


// 1) Endpoint que renderiza Presentacion Proyecto Backend 
router.get('/', (req, res) => {

    // Renderizando la plantilla
    res.render('index', {
        title: 'Presentacion Proyecto Backend Coder'
    })

    // http://localhost:5000/

})


// 7) Ruta Renderiza el formulario de Registro para un Usuario Nuevo - RENDERIZA DESDE LA RUTA RAIZ (RUTA BASE)
router.get('/register', async (req, res) => {

    if (req.session.user) {
        return res.redirect('/products')
    }

    const context = {}
    const errors = req.query.errors

    if (errors) {
        context.errors = JSON.parse(atob(errors))
    }

    res.render('register', context)// El objeto de parámetros está vacío, no necesitamos pasar datos por el momento.

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/register 
})

 
// 3) Endpoint para Renderiza TODOS los Productos Paginados 
router.get('/products', async (req, res) => {

    //console.log('views-PRODUCTS', req.session.user)
    console.log('views2-PRODUCTS', req.query)

    const { page } = req.query;
    const user = req.session.user;
    // console.log({ page })
    
    if (req.session.user) {
        
        const products = await prdController.getProducts(10, page)
        
        // Renderizando la plantilla /chat
        res.render('productList', {
            title: 'List Products',
            user: user,
            cartId: '',
            products: products.docs,
            pagination: {
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                // Aqui se convierte un numero N a un arreglo [1,...,N]
                pages: Array.from({ length: products.totalPages }, (_, i) => i + 1),
                page: products.page,
            }

        })

    } else {

        // sino volvemos al login 
        // Usamo el .redirect() para enviarlo a la plantilla de login
        res.redirect('/login')

    }
    

})


// 4) Endpoint para Renderizar un Carrito Especifico y Mostras los productos incluidos dentro del Carrito
router.get('/carts/:cid', async (req, res) => {

    console.log(req.params)

    // Desestructuramos lo que nos llega req.params
    const { cid } = req.params
    //console.log("aca", { cid })

    const cart = await cartController.getCartById(cid)

    //console.log("aca ", cart)


    // Renderizando la plantilla 
    res.render('carts', {

        title: 'Unique Cart',
        cartId: cart.id,
        products: cart.products,
        total: cart.total

    })

})


// 5) Endpoint Renderiza el formulario de login de un Usuario - RENDERIZA DESDE LA RUTA RAIZ (RUTA BASE)
//Permite enviar usuario y clave a un endpoint vía POST para validar
router.get('/login', async (req, res) => {

    
    // Verificando que viene por req.session.user
    console.log('views-LOGIN',req.session.user)

    // Si el usuario tiene sesión activa, no volvemos a mostrar el login,
    // directamente redireccionamos al perfil.
    if (req.session.user) {

        // como la sesion esta ACTIVA redirecciono la ruta http://localhost:5000/products para que muestre el listo de productos

        res.redirect('/products')

    } else {

        // Como NO esta Activa la Sesion Renderizo la ruta http://localhost:5000/login 
        // Importante: El objeto de parámetros está vacío no necesita datos para enviar, estamos RENDERIZANDO ".render()" la ruta PROPIA Y NO REDIGIENDO a otra, 
        res.render('login', {})

    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/login 
})


// 6) Endpoint Renderiza el Perfil de un Usuario con ya registrado - RENDERIZA DESDE LA RUTA RAIZ (RUTA BASE)
router.get('/profile', async (req, res) => {

    // Verificando que viene por req.session.user
    //console.log('views-PROFILE',req.session.user)

    // Validacion: si req.session.user no esta Vacio/Undifined entonces el usuario se logueo CORRECTAMENTE 
    // Si el usuario se logueo entonces tiene sesión activa, mostramos su perfil
    if (req.session.user) {

        res.render('profile', { user: req.session.user }) // Le paso los Datos del objet User a la plantilla para poder mostrarlo en la vista 

    } else {

        // sino volvemos al login 
        // Usamo el .redirect() para enviarlo a la plantilla de login
        res.redirect('/login')
    }

    //----- Rutas para USAR del Lado del cliente -----------
    // Para mostrar: http://localhost:5000/profile  
})


// 7) Endpoint Destruir la sesion del usuario y rediccionar a la formulario de login
router.get('/logout', async (req, res) => {
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
})


// ) Endpoint que renderiza la plantilla /chat para probar el chat websockets
router.get('/chat', (req, res) => {

    // Renderizando la plantilla /chat
    res.render('chat', {
        title: 'Chat BackendCoder'
    })

    // http://localhost:5000/chat

})


export default router