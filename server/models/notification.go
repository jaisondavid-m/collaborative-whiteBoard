package models

import "gorm.io/gorm"

type Notification struct {
	gorm.Model

	Title 			string 			`json:"title" gorm:"not null"`
	Message 		string 			`json:"message" gorm:"not null;type:text"`
	SenderID 		string 			`json:"senderId" gorm:"index"`
	RecipientID 	string 			`json:"recipientId" gorm:"index"`
	IsRead 			bool 			`json:"is_read" gorm:"default:false"`
	Type 			string 			`json:"type" gorm:"default:'info'"`
}