package models

import "gorm.io/gorm"


type FriendRequest struct {

	gorm.Model

	SenderID 		string			`json:"sender_id" gorm:"index;not null"`
	ReceiverID 		string			`json:"receiver_id" gorm:"index;not null"`
	Status 			string 			`json:"status" gorm:"default:'pending'"` //pending,accepted,rejected

}

type Friendship struct {

	gorm.Model

	User1ID 		string			`json:"user1_id" gorm:"index;not null"`
	User2ID 		string			`json:"user2_id" gorm:"index;not null"`

}

type SendFriendRequestInput struct {
	ReceiverID 		string 			`json:"receiver_id" binding:"required"`
}