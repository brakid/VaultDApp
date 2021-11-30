package utils

import (
	"io/ioutil"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
)

type Contract struct {
	ContractAddress *common.Address
	ContractAbi     *abi.ABI
}

func GetContractAbi(fileName string) (*abi.ABI, error) {
	abiJson, err := ioutil.ReadFile(fileName)
	if err != nil {
		return nil, err
	}

	contractAbi, err := abi.JSON(strings.NewReader(string(abiJson)))
	if err != nil {
		return nil, err
	}

	return &contractAbi, nil
}
