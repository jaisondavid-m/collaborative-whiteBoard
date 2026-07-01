package models

import "gorm.io/gorm"

type UserVisit struct {
	
	gorm.Model

	UserID 			string 			`json:"userId" gorm:"index;not null"`
	VisitDate 		string 			`json:"visitDate" gorm:"index;not null"`

}