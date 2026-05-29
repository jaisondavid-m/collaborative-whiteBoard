package models

type RegisterInput struct {
	UserID 			string 		`json:"userid"`
	Password 		string 		`json:"password"`
}

type UpdateRoleInput struct {
	UserID			string		`json:"userid"`
	Role			string		`json:"role"`
}

type GoogleLoginRequest struct {
	Token string `json:"token" binding:"required" `
}