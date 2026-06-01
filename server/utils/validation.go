package utils

import (

	"errors"
	"regexp"
	"unicode"

)

func ValidatePassword(password string) error {

	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	if len(password) > 64 {
		return errors.New("password cannot exceed 64 characters")
	}

	var hasUpper bool
	var hasLower bool
	var hasNumber bool
	var hasSpecial bool

	for _, char := range password {

		switch {

		case unicode.IsUpper(char):
			hasUpper = true
		
		case unicode.IsLower(char):
			hasLower = true

		case unicode.IsDigit(char):
			hasNumber = true

		case regexp.MustCompile("[!@#$%^&&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]").MatchString(string(char)):
			hasSpecial = true
		}
	}

	if !hasUpper {
		return errors.New("password must contain at least one uppercase")
	}

	if !hasLower {
		return errors.New("password must contain at least one lowercase letter")
	}

	if !hasNumber {
		return errors.New("password must contain at least one number")
	}

	if !hasSpecial {
		return errors.New("password must contain at least one special character")
	}

	return nil

}

func ValidateUserID(userid string) error {

	if len(userid) < 4 {
		return errors.New("user id must be at least 4 characters")
	}

	if len(userid) > 30 {
		return errors.New("user id cannot exceed 30 characters")
	}

	regex := regexp.MustCompile(`^[a-zA-Z0-9]+$`)

	if !regex.MatchString(userid) {
		return errors.New("user id can only contain letters, numbers and underscore")
	}

	return nil

}