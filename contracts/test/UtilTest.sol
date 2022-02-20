pragma ton-solidity >= 0.57.3;

import "../Util.sol";

contract UtilTest {
    function percentage(uint128 amount, uint128 permille)
    public
    pure
    returns (uint128) {
        return Util.percentage(amount, permille);
    }
}
