pragma ton-solidity >= 0.57.3;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "Util.sol";

abstract contract GameBase {
    uint128 public rake;
    event RakeChanged(uint128 rake);

    modifier onlyPublisher {
        require(msg.pubkey() == tvm.pubkey(), 102);
        tvm.accept();
        _;
    }

    function changeRake(uint128 value) public onlyPublisher {
        rake = value;
        emit RakeChanged(rake);
    }

    function _calcReward(uint128 amount) internal view returns(uint128) {
        return amount - Util.percentage(amount, rake);
    }

    // Public off-chain utils
    function createHash(
        string nameOption,
        uint256 notice
    ) public pure returns(uint256 hash) {
        hash = tvm.hash(format("{}-{}", nameOption, notice));
    }
}
