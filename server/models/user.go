package models

import "gorm.io/gorm"

type User struct {
	gorm.Model

	UserID 		string 		`json:"userid" gorm:"unique;not null;size:30"`
	Password 	string		`json:"password" gorm:"not null"`
	Role		string		`json:"role" gorm:"default:'user'"`
	IsDeleted	bool		`json:"is_deleted" gorm:"default:false"`
	
}