import { Model } from "mongoose";
import { IBlackListedToken } from "../../Common";
import { BaseRepository } from "./base.repository";

export class BlackListedTokenRepository extends BaseRepository<IBlackListedToken> {
    constructor(protected _blackListTokenModel: Model<IBlackListedToken>) {
        super(_blackListTokenModel)
    }
}