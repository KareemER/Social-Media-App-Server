import { Socket } from "socket.io";
import { MessageModel } from "../../../DB/Models";
import { ConversationRepository, MessagesRepository } from "../../../DB/Repositories";
import { ConversationTypeEnum } from "../../../Common";
import { getIo } from "../../../Gateways/socketIo.gateway";


export class ChatService {

    private conversationRepository: ConversationRepository = new ConversationRepository()
    private messageRepository: MessagesRepository = new MessagesRepository(MessageModel)

// ============================ Private Message ============================

    async joinPrivateChat(socket: Socket, targetUserId: string) {

        let conversation = await this.conversationRepository.findOneDocument({
            type: ConversationTypeEnum.DIRECT,
            members: { $all: [ socket.data.userId, targetUserId ] }
        })
        if(!conversation){
            conversation = await this.conversationRepository.createNewDocument({
                type: ConversationTypeEnum.DIRECT,
                members: [ socket.data.userId, targetUserId ]
            })
        }
        socket.join(conversation._id!.toString())
        return conversation
    }

    async sendPrivateMessage(socket: Socket, data: unknown){
        const { text, targetUserId } = data as { text: string, targetUserId: string}
        const conversation = await this.joinPrivateChat(socket, targetUserId)

        // create message
        const message = await this.messageRepository.createNewDocument({
            text,
            converstionId: conversation._id,
            senderId: socket.data.userId
        })

        getIo()?.to(conversation._id!.toString()).emit('message-sent', message)
    }

    async getConversationMessages(socket: Socket, targetUserId: string) {
        const conversation = await this.joinPrivateChat(socket, targetUserId)
        const messages = await this.messageRepository.findDocuments({converstionId: conversation._id})
        socket.emit('chat-history', messages)
    }

// ============================ Group Message ============================ 

    async joinGroupChat(socket: Socket, targetGroupId: string) {
        let conversation = await this.conversationRepository.findOneDocument({
           id: targetGroupId,
           type: 'group'
        })
        socket.join(conversation!._id!.toString())
        return conversation
    }

    async sendGroupMessage(socket: Socket, data: unknown){
        const { text, targetGroupId } = data as { text: string, targetGroupId: string}
        const conversation = await this.joinGroupChat(socket, targetGroupId)

        // create message
        const message = await this.messageRepository.createNewDocument({
            text,
            converstionId: conversation!._id,
            senderId: socket.data.userId
        })
        getIo()?.to(conversation!._id!.toString()).emit('message-sent', message)
    }

    async getGroupHistory(socket: Socket, targetGroupId: string) {
        const messages = await this.messageRepository.findDocuments({ 
        converstionId: targetGroupId 
        })
        socket.emit('group-chat-history', messages)
    }
}