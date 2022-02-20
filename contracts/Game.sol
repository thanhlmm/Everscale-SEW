pragma ton-solidity >= 0.57.3;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "GameBase.sol";

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

    function bet(uint256 betHash) external returns(optional(Bet) status) {
        require(msg.sender != address(0), 401);
        require(msg.value > 0 && betHash != 0, 403);
        // TODO maybe need add veryfi hash
        status = _addBet(msg.sender, betHash, msg.value);
        if (status.hasValue()) {
           emit BetCreated(msg.sender, status.get());
        }
    }

    function beat(
        uint256 betId,
        string chose
    ) external returns(optional(Bet) status) {
        require(msg.sender != address(0), 401);
        require(msg.value > 0 && betId != 0, 403); // FIXME amount
        require(listBet.exists(betId), 404);
        Bet data = listBet.fetch(betId).get();
        require(msg.value >= data.amount, 403);
        require(!data.beat.hasValue(), 403);
        data.beat = Beat(msg.sender, chose);
        status = listBet.getReplace(betId, data);
        if (status.hasValue()) {
            emit BetBeaten(msg.sender, status.get());
        }
    }

    function redeem(
        uint256 betId,
        optional(string) betChose,
        optional(uint256) notice
    ) external {
        require(msg.sender != address(0), 401);
        require(listBet.exists(betId), 404);
        Bet data = listBet.fetch(betId).get();
        require(data.beat.hasValue(), 404);
        require(msg.sender == data.user || msg.sender == data.beat.get().user, 403);
        require(_validateBet(data, betChose, notice), 501);
        uint2 status = _checkBet(data, betChose.get());
        if (status == 1) {
            data.user.transfer(_calc(data.amount), false, 1);
        } else if (status == 2) {
            data.beat.get().user.transfer(_calc(data.amount), false, 1);
        } else {
            uint128 amount = math.divr(_calc(data.amount), 2);
            data.user.transfer(amount, false, 1);
            data.beat.get().user.transfer(amount, false, 1);
        }
        delete listBet[betId];
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

    // Public off-chain utils
    function createBet(
        string chose
    ) public view returns(uint256 hash, uint256 notice) {
        require(_existsOption(chose), 404);
        rnd.shuffle();
        notice = rnd.next();
        hash = createHash(chose, notice);
    }
}
