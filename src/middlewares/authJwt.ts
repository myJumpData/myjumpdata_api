import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../consts/auth";
import User from "../models/user.model";
import { requestHandler } from "../utils/requestHandler";

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return requestHandler(
      res,
      401,
      "unauthorized.accesstoken",
      "Access Token expired"
    );
  }

  return requestHandler(res, 401, "unauthorized", "Unauthorized");
};

export default function verifyToken(req, res, next) {
  const token = req.headers["x-access-token"];

  if (!token) {
    return requestHandler(
      res,
      401,
      "unauthorized.accesstoken.not",
      "No token provided"
    );
  }

  jwt.verify(token, JWT_SECRET, {}, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded?.id;
    if (decoded?.id) {
      User.findOne({ id: decoded.id })
        .populate("roles")
        .then((response: any) => {
          req.userRoles = response.roles.map((role) => role.name);
          if (response.active !== true) {
            return catchError(undefined, res);
          }
          return next();
        });
    } else {
      return catchError(undefined, res);
    }
  });
}
