import bcrypt from 'bcrypt';

import errorMessages from './errors/enums.js';
import CustomError from './errors/customError.class.js';
import config from '../config.js';

export const createHash = password => bcrypt.hashSync(password,bcrypt.genSaltSync(10));

export const isValidPassword = (enteredPassword, savedPassword) => {
  return bcrypt.compareSync(enteredPassword, savedPassword);
};

export const verifyRequiredBody = (requiredFields) => {
  return (req, res, next) => {
      const allOk = requiredFields.every(field => 
          req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined
      );
      
      //if (!allOk) return res.status(400).send({ origin: config.SERVER, payload: 'Faltan propiedades', requiredFields });
      if(!allOk) {
        throw new CustomError(errorMessages.FEW_PARAMETERS)}
    next();
  };
};
export const handlePolicies = (policies) => {
  return async (req, res, next) => {
    const user = current(req)
    if (!user)
      return res
        .status(401)
        .send({ origin: config.SERVER, payload: "Usuario no autenticado" });

    if (policies.includes(user.role)) return next();

    res.status(403).send({
      origin: config.SERVER,
      payload: "No tiene permisos para acceder al recurso",
    });
  };
};
export const current = (req) => {
  if (!req.session.user) {
    return null;
  }

  const { password, ...foundUser } = req.session.user;
  const userWithIdAsString = {
    ...foundUser,
    _id: foundUser._id.toString()
  };

  return userWithIdAsString;
};