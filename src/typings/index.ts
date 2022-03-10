export type Message = {
    sender: string,
    text: string
}

export type User = {
    username: string,
    id: string
}

export type OpenChatRequest = {
    recipientId: string,
    sender: string
}