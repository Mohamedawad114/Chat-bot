import { Types } from "mongoose";
import { Sys_Role } from "../Enum";

export interface IToken {
  id:Types.ObjectId;
  username:string;
  role:Sys_Role;
}
export interface IDecodedToken extends IToken {}