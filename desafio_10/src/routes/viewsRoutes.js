
import { Router } from "express";
import ProductManager from "../controllers/productManager.js";
import cartManager from "../controllers/cartManager.js";
import {handlePolicies, current } from "../services/utils.js";

const router = Router();
const manager = new ProductManager();
const cartsManager = new cartManager();
router.get("/redirigir",(req,res)=>{
  const user = current(req);
  if (user.role === "admin") {
    res.status(200).render("realTimeProducts", {});
  }else{
    res.status(200).render("products",{});
  }

});

router.get("/realtimeproducts", handlePolicies(['admin', 'premium']), async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  try {
    const user = current(req);
    const limit = req.query.limit;
    const page = req.query.page;
    const query = req.query.query;
    const sort = req.query.sort;
    const products = await manager.getAll(limit, page, query, sort);
    const userId = user._id;
    const carritoUsu = await cartsManager.getCartByUsuId(userId);
    const userModificado = { ...user, _id: userId };
    if(user.role == "admin"){
      res.status(200).render("realTimeProducts", {
        products: products,
        user: userModificado,
        idCart: carritoUsu._id.toString()
      });

    }else{
      const userProducts = products.filter(product => 
        product.owner === user._id.toString()
      );
      res.status(200).render("realTimePremium", {
        products: userProducts,
        user: userModificado,
        idCart: carritoUsu._id.toString()
      });
    }

  } catch (error) {
    console.error("Error fetching real-time products:", error);
    res.status(500).send("An error occurred while fetching real-time products.");
  }
});


router.get("/products", handlePolicies(['user', 'premium']), async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  try {
    const user = current(req);
    const limit = req.query.limit;
    const page = req.query.page;
    const query = req.query.query;
    const sort = req.query.sort;
    const products = await manager.getAll(limit, page, query, sort);
    const userId = user._id;
    const carritoUsu = await cartsManager.getCartByUsuId(userId);
    const userModificado = { ...user, _id: userId };

    if (user.role === 'user') {

      res.status(200).render("products", {
        products: products,
        user: userModificado,
        idCart: carritoUsu._id.toString()
      });
    } else {
      console.log(user);
      
      const otherProducts = products.filter(product => product.owner !== user._id.toString());
      console.log((otherProducts));
      res.status(200).render("productsPremium", {
        user: userModificado,
        idCart: carritoUsu._id.toString(),
        otherProducts
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("An error occurred while fetching products.");
  }
});


router.get("/register", (req, res) => {
  res.render("register", {});
});

router.get("/login", (req, res) => {
  // Si hay datos de sesión activos, redireccionamos al perfil
  res.render("login", {showError: req.query.error ? true: false, errorMessage: req.query.error});
});
router.get("/modify/:pid", async (req, res) => {
  
  const product = await manager.getById( req.params.pid);
  const user = current(req);
  
  res.status(200).render("modifyProduct", {product:product , user:user});
  
});


export default router;

