import { Model } from "mongoose";
import { IUser } from "../../Common";
import { UserModel } from "../Models";
import { BaseRepository } from "./base.repository";



export class UserRepository extends BaseRepository<IUser>{
    constructor(protected _usermodel:Model<IUser>){
        super(_usermodel);
    }
}

