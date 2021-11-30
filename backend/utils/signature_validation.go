package utils

import (
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	solsha3 "github.com/miguelmota/go-solidity-sha3"
)

// different hash calculation needed due to ethers logic to convert hex strings into bytes instead of recognizing them as hex.
func ValidateSignature(address *common.Address, timestamp int64, id int64, signature []byte) (bool, error) {
	signature[64] = signature[64] - byte(27)
	recordHash := solsha3.SoliditySHA3(
		solsha3.Address(address.Hex()),
		solsha3.Uint256(big.NewInt(timestamp)),
		solsha3.Uint256(big.NewInt(id)),
	)
	recordHashString := "0x" + common.Bytes2Hex(recordHash)
	prefixString := fmt.Sprintf("\x19Ethereum Signed Message:\n%v", len(recordHashString))
	signatureHash := crypto.Keccak256Hash(append([]byte(prefixString), []byte(recordHashString)...))

	publicKey, err := crypto.SigToPub(signatureHash.Bytes(), signature)
	if err != nil {
		return false, err
	}

	return crypto.PubkeyToAddress(*publicKey) == *address, nil
}
