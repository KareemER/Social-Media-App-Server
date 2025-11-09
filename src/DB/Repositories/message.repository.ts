import { BaseRepository } from "./base.repository";
import { IMessage } from "../../Common";
import { Model } from "mongoose";

export class MessagesRepository extends BaseRepository<IMessage>{
    constructor(protected _messagemodel: Model<IMessage>){
        super(_messagemodel)
    }
}