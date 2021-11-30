package utils

import (
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
)

func Test_SignatureRecovery(t *testing.T) {
	signature := common.Hex2Bytes("0xc38caabca4622b113691c758dcdd988b0b9eac3b616a2f6f348fb60efe2603a123bef9573eba66ae12585f064b4ba517a95e8535d49f2cc41ec642d74e4b85001b"[2:])
	id := int64(2)
	timestamp := int64(1638308898)
	senderAddress := common.HexToAddress("0x644F8Af43CDF7d35d01e0750b08cf7362f605E10")

	valid, _ := ValidateSignature(&senderAddress, timestamp, id, signature)

	assert.True(t, valid)
}
