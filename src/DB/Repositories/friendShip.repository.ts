import { BaseRepository } from "./base.repository";
import { IFriendShip } from "../../Common";
import { FriendShipModel } from "../Models";



export  class FriendShipRepository extends BaseRepository<IFriendShip> {
    constructor() {
        super(FriendShipModel)
    }
}