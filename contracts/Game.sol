pragma ton-solidity >= 0.57.3;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "GameBase.sol";
import "util/Gas.sol";

contract Game is
GameBase
{
    constructor()
    public
    onlyPublisher
    {
        require(tvm.pubkey() != 0, 101);
        rake = 500; // 0.5%
        _addOption("S", ["W"]);
        _addOption("E", ["S"]);
        _addOption("W", ["E"]);
    }

    function bet(
        uint256 betHash,
        uint128 amount
    ) external {
        require(msg.sender != address(0), 401);
        require(msg.value >= amount + Gas.BET, 403);
        tvm.rawReserve(amount, 4);
        require(betHash != 0, 403);
        // TODO maybe need add veryfi hash
        optional(Bet) status = _addBet(msg.sender, betHash, amount);
        if (status.hasValue()) {
           emit BetCreated(msg.sender, status.get());
        }
        msg.sender.transfer({value: 0, flag: 128});
    }

    function beat(
        uint256 betId,
        string chose
    ) external {
        require(msg.sender != address(0), 401);
        require(betId != 0, 403);
        require(listBet.exists(betId), 404);
        Bet betData = listBet.fetch(betId).get();
        require(msg.value >= betData.amount + Gas.BEAT, 403);
        require(!betData.beat.hasValue(), 403);
        betData.beat = Beat(msg.sender, chose);
        tvm.rawReserve(betData.amount, 4);
        betData.amount += betData.amount;
        optional(Bet) status = listBet.getReplace(betId, betData);
        if (status.hasValue()) {
            emit BetBeaten(msg.sender, status.get());
        }
        msg.sender.transfer({value: 0, flag: 128});
    }

    function redeem(
        uint256 betId,
        optional(string) betChose,
        optional(uint256) notice
    ) external {
        require(msg.sender != address(0), 401);
        require(listBet.exists(betId), 404);
        Bet betData = listBet.fetch(betId).get();
        require(betData.beat.hasValue(), 404);
        require(msg.sender == betData.user || msg.sender == betData.beat.get().user, 403);
        require(_validateBet(betData, betChose, notice), 501);
        uint2 status = _checkBet(betData, betChose.get());
        uint128 reward = _calcReward(betData.amount);
        tvm.rawReserve(reward, 12);
        if (status == 1) {
            betData.user.transfer(reward, false, 1);
        } else if (status == 2) {
            betData.beat.get().user.transfer(reward, false, 1);
        } else {
            uint128 amount = math.divr(reward, 2);
            betData.user.transfer(amount, false, 1);
            betData.beat.get().user.transfer(amount, false, 1);
        }
        delete listBet[betId];
        msg.sender.transfer({value: 0, flag: 128});
    }

    // listOption
    struct Option {
        string name;
        string[] win;
    }
    mapping(uint256 => Option) public listOption;
    event BetBeaten(address user, Bet betData);

    function _keyOption(string chose)
    private
    pure returns(uint256) {
        return tvm.hash(chose); // TODO add upper https://github.com/willitscale/solidity-util/blob/master/lib/Strings.sol#L306-L315
    }
    function _addOption(string chose, string[] win)
    private
    returns(bool) {
        return listOption.add(_keyOption(chose), Option(chose, win));
    }
    function _existsOption(string chose)
    private
    view returns(bool) {
        return listOption.exists(_keyOption(chose));
    }
    function _getOption(string chose)
    private
    view returns(Option) {
        return listOption.fetch(_keyOption(chose)).get();
    }

    // listBet
    struct Bet {
        address user;
        uint256 hash;
        uint128 amount;
        optional(Beat) beat;
    }
    struct Beat {
        address user;
        string chose;
    }
    mapping(uint256 => Bet) public listBet;
    event BetCreated(address user, Bet bet);

    function _validateBet(
        Bet betData,
        optional(string) betChose,
        optional(uint256) notice
    ) private view returns(bool) {
        return betChose.hasValue() &&
            notice.hasValue() &&
            betData.hash == createHash(betChose.get(), notice.get()) &&
            _existsOption(betChose.get());
    }

    function _checkBet(Bet betData, string betChose) private view returns(uint2) {
        Beat beatData = betData.beat.get();
        for (string item: _getOption(betChose).win) {
            if (item == beatData.chose) {
                return 1;
            }
        }
        for (string item: _getOption(beatData.chose).win) {
            if (item == betChose) {
                return 2;
            }
        }
        return 0;
    }

    function _betId(
        address user,
        uint256 betHash
    ) private pure returns(uint256) {
        return tvm.hash(format("{}-{}", user, betHash));
    }

    function _addBet(
        address user,
        uint256 betHash,
        uint128 amount
    ) private returns(optional(Bet)) {
        return listBet.getAdd(
            _betId(user, betHash),
            Bet(user, betHash, amount, null)
        );
    }
}
