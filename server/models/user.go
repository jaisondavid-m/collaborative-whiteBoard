package models

import "gorm.io/gorm"

type User struct {
	gorm.Model

	UserID 				string 		`json:"userid" gorm:"unique;not null;size:30"`
	Password 			string		`json:"password" gorm:"not null"`
	Role				string		`json:"role" gorm:"default:'user'"`
	CurrentToken 		string 		`json:"-" gorm:"type:text"`
	IsDeleted			bool		`json:"is_deleted" gorm:"default:false"`
	IsBlocked 			bool		`json:"is_blocked" gorm:"default:false"`
	
}