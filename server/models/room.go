package models

import (
	"gorm.io/gorm"
)

type Room struct {
	gorm.Model
	RoomID 			string 			`json:"roomId" gorm:"unique;not null"`
	Name 			string 			`json:"name"`
	OwnerID 		uint 			`json:"ownerId"`
	IsActive 		bool 			`json:"isActive" gorm:"default:true"`
}