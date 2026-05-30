package models

import "gorm.io/gorm"

type AuditLog struct {

	gorm.Model

	ActorID 	string		`json:"actorId" gorm:"index"`
	ActorRole 	string		`json:"actorRole"`
	Action 		string		`json:"action" gorm:"index"`
	TargetType 	string		`json:"targetType"`
	TargetID 	string		`json:"targetId"`
	Meta 		string		`json:"meta"`
	IP 			string		`json:"ip"`
	Status 		string		`json:"status"`
	
}