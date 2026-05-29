package models

import "gorm.io/gorm"

type User struct {
	gorm.Model

	UserID 		string 		`json:"userid" gorm:"unique;not null"`
	Password 	string		`json:"password"`
	Role		string		`json:"role" gorm:"default:'user'"`
}