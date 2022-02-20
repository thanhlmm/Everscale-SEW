pragma ton-solidity >= 0.57.3;

library Util {
    uint17 constant PERMILLE_EXP = 100000;
    function percentage(uint128 amount, uint128 permille) public returns(uint128) {
        return amount * permille / uint128(PERMILLE_EXP);
    }
}
