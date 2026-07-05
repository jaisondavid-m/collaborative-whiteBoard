package models

import "gorm.io/gorm"

type Message struct {

	gorm.Model

	SenderID 		string			`json:"senderId" gorm:"index;not null"`
	ReceiverID		string			`json:"receiverId" gorm:"index;not null"`

	Content 		string			`json:"content" gorm:"type:text;not null"`
	MessageType		string			`json:"messageType" gorm:"default:'text'"`

	IsRead 			bool			`json:"isRead" gorm:"default:false"`
	IsDeleted 		bool			`json:"isDeleted" gorm:"default:false"`
	IsEdited 		bool			`json:"isEdited" gorm:"default:false"`

}

type Conversation struct {

	gorm.Model

	User1ID			string			`json:"user1Id" gorm:"index"`
	User2ID			string			`json:"user2Id" gorm:"index"`

	LastMessage		string			`json:"lastMessage"`
	LastSender		string			`json:"lastSender"`

}

type SendMessageInput struct {
	ReceiverID 		string		`json:"receiverId" binding:"required"`
	Content 		string		`json:"content" binding:"required"`
	MessageType 	string 		`json:"messageType"`
}

