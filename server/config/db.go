package config

import (
	"server/models"
	"fmt"
	"log"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {

	username := "root"
	password := "jaison"
	host 	 := "127.0.0.1"
	port 	 := "3306"
	dbname 	 := "cw_db"

	dsn := fmt.Sprintf("%s:%s@tcp:(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		username,
		password,
		host,
		port,
		dbname,
	)

	database, err := gorm.Open(mysql.Open(dsn),&gorm.Config{})
	if err != nil {
		log.Fatal("Database Connection Failed")
	}

	DB = database

	err = DB.AutoMigrate()
	if err != nil {
		log.Fatal("Migration Failed")
	}
	fmt.Println("Database connected")

}