import { BaseRepository } from "./base.repository";
import { IConverstion } from "../../Common";
import { converstionModel } from "../Models";


export class ConversationRepository extends BaseRepository<IConverstion>{
    constructor() {
        super(converstionModel)
    }
}