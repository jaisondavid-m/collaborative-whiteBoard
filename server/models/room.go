package models

import (
	"gorm.io/gorm"
)

type Room struct {
	gorm.Model
	RoomID 			string 			`json:"roomId" gorm:"unique;not null"`
	Name 			string 			`json:"name"`
	OwnerID 		string 			`json:"ownerId" gorm:"index"`
	IsActive 		bool 			`json:"isActive" gorm:"default:true"`
	Password 		string			`json:"-" gorm:"default:null"`
}