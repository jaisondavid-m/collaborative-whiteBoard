package config

import (
	"fmt"
	"log"
	"os"
	"server/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {

	username := os.Getenv("DB_USERNAME")
	password := os.Getenv("DB_PASSWORD")
	host 	 := os.Getenv("DB_HOST")
	port 	 := os.Getenv("DB_PORT")
	dbname 	 := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
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

	err = DB.AutoMigrate(
		&models.User{},
		&models.Room{},
	)
	if err != nil {
		log.Fatal("Migration Failed")
	}

	fmt.Println("Database connected")

}