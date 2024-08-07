import { Router } from "express"; 
import passport from "passport";

import config from "../config.js";
import usersManager from "../controllers/users.manager.mdb.js"
import { verifyRequiredBody, handlePolicies } from "../services/utils.js";
import initAuthStrategies from "../auth/passport.strategies.js";
import cartManager from "../controllers/cartManager.js"

const router = Router();

const manager = new usersManager();
const cartsManager = new cartManager();

initAuthStrategies();


router.post( "/login", verifyRequiredBody(["email", "password"]),passport.authenticate("login", {failureRedirect: `/login?error=${encodeURI("Usuario o clave no válidos")}`,}),async (req, res) => {
    try {
        req.session.user = req.user;
        req.session.save((err) => {
          if (err)
            return res
              .status(500)
              .send({
                origin: config.SERVER,
                payload: null,
                error: err.message,
              });

          res.redirect("/profile");
        });
    } catch (err) {
      res
        .status(500)
        .send({ origin: config.SERVER, payload: null, error: err.message });
    }
  }
);
router.get("/ghlogin",passport.authenticate("ghlogin", { scope: ["user"] }),async (req, res) => {}
);

router.get("/ghlogincallback",passport.authenticate("ghlogin", {failureRedirect: `/login?error=${encodeURI("Error al identificar con Github")}`,}),async (req, res) => {  
  try {
      req.session.user = req.user;
      req.session.save((err) => {
        if (err)
          return res
            .status(500)
            .send({ origin: config.SERVER, payload: null, error: err.message });

        res.redirect("/profile");
      });
    } catch (err) {
      res
        .status(500)
        .send({ origin: config.SERVER, payload: null, error: err.message });
    }
  }
);

// Limpiamos los datos de sesión
router.get("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err)return res.status(500).send({ origin: config.SERVER, payload: "Error al ejecutar logout", error: err});
      res.redirect('/login');
      
    });
  } catch (err) {
    res
      .status(500)
      .send({ origin: config.SERVER, payload: null, error: err.message });
  }
});


router.post("/register",verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    const result = await manager.Aggregated(req.body);

    if (result === "El email ya está registrado.") {
      return res.status(400).send({ message: result });
    }
    cartsManager.addCart(result._id.toHexString());
    req.session.user = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      _id: result._id.toHexString(),
    };
    req.session.save((err) => {
        if (err)
          return res
            .status(500)
            .send({ origin: config.SERVER, payload: null, error: err.message });

        res.redirect("/profile");
    });
  } catch (err) {
    res
      .status(500)
      .send({ origin: config.SERVER, payload: null, error: err.message });
  }
});

router.get("/admin", handlePolicies(["admin"]), async (req, res) => {
  try {
    res
      .status(200)
      .send({ origin: config.SERVER, payload: "Bienvenido ADMIN!" });
  } catch (err) {
    res
      .status(500)
      .send({ origin: config.SERVER, payload: null, error: err.message });
  }
});

export default router;
