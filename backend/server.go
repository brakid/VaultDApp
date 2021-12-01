package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"math/big"
	"net/http"
	"os"
	"strconv"
	"time"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"vaultbackend/abi"
	"vaultbackend/utils"
)

type Authentication struct {
	Address   string `json:"address"`
	Signature string `json:"signature"`
	Timestamp int64  `json:"timestamp"`
}

type AuthenticationWithContent struct {
	Authentication
	Content string `json:"content"`
}

func validateAuthentication(authentication *Authentication, id int64) (int, error) {
	if !common.IsHexAddress(authentication.Address) {
		return http.StatusBadRequest, fmt.Errorf("invalid sender address")
	}

	currentTimestamp := time.Now().Unix()
	if math.Abs(float64(currentTimestamp-authentication.Timestamp)) > 300 { // at most 5 minutes old
		return http.StatusBadRequest, fmt.Errorf("invalid timestamp")
	}

	address := common.HexToAddress(authentication.Address)
	signature := common.Hex2Bytes(authentication.Signature[2:])
	valid, err := utils.ValidateSignature(&address, authentication.Timestamp, id, signature)
	if err != nil {
		return http.StatusBadRequest, err
	}
	if !valid {
		return http.StatusForbidden, fmt.Errorf("invalid signature provided")
	}

	return 0, nil
}

func validateOwnership(address *common.Address, id int64, vaultToken *abi.Abi) (int, error) {
	ownerAddress, err := vaultToken.OwnerOf(nil, big.NewInt(id))
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if ownerAddress.Hex() == address.Hex() {
		return 0, nil
	}

	return http.StatusForbidden, fmt.Errorf("not the owner")
}

func main() {
	port, present := os.LookupEnv("PORT")

	if !present {
		port = "8080"
	}

	contractAddress := common.HexToAddress("0xd9fdd544c7db7a69d87755cc702dee49e44c4857")
	ethereumAddress := "https://rpc-mumbai.maticvigil.com/"

	client, err := ethclient.Dial(ethereumAddress)
	if err != nil {
		log.Fatal(err)
	}

	defer client.Close()

	log.Println("Connection established")

	vaultToken, err := abi.NewAbi(contractAddress, client)
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()
	app, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile("./credentials.json"))
	if err != nil {
		log.Fatalln(err)
	}

	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalln(err)
	}
	defer firestoreClient.Close()

	gin.ForceConsoleColor()
	r := gin.Default()

	r.Use(cors.Default())

	r.POST("/read/vault/:id", func(context *gin.Context) {
		idString := context.Param("id")
		id, err := strconv.ParseInt(idString, 10, 64)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		authenticationJson, err := ioutil.ReadAll(context.Request.Body)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		authentication := Authentication{}
		err = json.Unmarshal(authenticationJson, &authentication)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		statusCode, err := validateAuthentication(&authentication, id)
		if err != nil {
			context.String(statusCode, err.Error())
			return
		}

		address := common.HexToAddress(authentication.Address)
		statusCode, err = validateOwnership(&address, id, vaultToken)
		if err != nil {
			context.String(statusCode, err.Error())
			return
		}

		log.Printf("%v", authentication)

		vault := firestoreClient.Collection("vaultdata")
		vaultDocuments := vault.Query.Where("vault", "==", idString).Documents(ctx)
		document, err := vaultDocuments.Next()
		var content string
		if err != nil {
			content = ""
		} else {
			content = fmt.Sprintf("%v", document.Data()["data"])
		}

		context.JSON(http.StatusOK, content)
	})

	r.POST("/write/vault/:id", func(context *gin.Context) {
		idString := context.Param("id")
		id, err := strconv.ParseInt(idString, 10, 64)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		authenticationWithContentJson, err := ioutil.ReadAll(context.Request.Body)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		authenticationWithContent := AuthenticationWithContent{}
		err = json.Unmarshal(authenticationWithContentJson, &authenticationWithContent)
		if err != nil {
			context.String(http.StatusBadRequest, err.Error())
			return
		}

		statusCode, err := validateAuthentication(&authenticationWithContent.Authentication, id)
		if err != nil {
			context.String(statusCode, err.Error())
			return
		}

		address := common.HexToAddress(authenticationWithContent.Address)
		statusCode, err = validateOwnership(&address, id, vaultToken)
		if err != nil {
			context.String(statusCode, err.Error())
			return
		}

		log.Printf("%v", authenticationWithContent)

		vault := firestoreClient.Collection("vaultdata")
		vaultDocuments := vault.Query.Where("vault", "==", idString).Documents(ctx)
		document, err := vaultDocuments.Next()
		if err != nil {
			data := make(map[string]string)
			data["vault"] = idString
			data["data"] = authenticationWithContent.Content
			document, _, err := vault.Add(ctx, data)
			if err != nil {
				context.String(http.StatusInternalServerError, err.Error())
				return
			}
			documentSnapshot, err := document.Get(ctx)
			if err != nil {
				context.String(http.StatusInternalServerError, err.Error())
				return
			}
			context.JSON(http.StatusOK, documentSnapshot.Data()["data"])
			return
		}

		data := document.Data()
		data["data"] = authenticationWithContent.Content
		_, err = vault.Doc(document.Ref.ID).Set(ctx, data)
		if err != nil {
			context.String(http.StatusInternalServerError, err.Error())
			return
		}
		context.JSON(http.StatusOK, authenticationWithContent.Content)
	})

	r.Run(":" + port)
}
