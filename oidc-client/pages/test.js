import Mahjong from "../components/mahjong.component"

export default function Test() {
    return <Mahjong gameData={eatData} moves={eatMoves}></Mahjong>
}

const testData = {
    "id":"8b52f93b-6f93-4ef9-91d5-8ea537fa7aa8","type":"MAHJONG",
    "data":{
        "deckSize":74,
        "tilesOut":["STICK_2","STICK_2","STICK_4","NUMBER_1","NUMBER_4","NUMBER_4","NUMBER_9","CIRCLE_4","CIRCLE_5","CIRCLE_6","SOUTH"],
        "currentPlayerId":"48f40de3-f4ed-4fd6-892a-c7b96f47da3b",
        "winner":null,
        "playersToMove":["48f40de3-f4ed-4fd6-892a-c7b96f47da3b"]
    },
    "playerData":{
        "hand":["STICK_2","STICK_2","STICK_4","NUMBER_1","NUMBER_4","NUMBER_4","NUMBER_9","CIRCLE_4","CIRCLE_5","CIRCLE_6","FA","EAST","SOUTH","SOUTH","WEST","NORTH"],
        "groupings":[["STICK_1", "STICK_2", "STICK_3"], ["FA", "FA", "FA"]],
        "flowers":["FLOWER_A1"]
    }
}

const playData = {"id":"7dfc64ef-d357-4a8d-a9f2-14445ea6346b","type":"MAHJONG","data":{"deckSize":77,"tilesOut":[],"currentPlayerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","winner":null,"playersToMove":["d302ceb1-cf4b-44f1-abda-b0aaa91ac994"]},"playerData":{"hand":["STICK_1","STICK_3","STICK_3","STICK_3","STICK_4","STICK_4","NUMBER_1","NUMBER_1","NUMBER_1","NUMBER_2","NUMBER_4","NUMBER_5","NUMBER_8","CIRCLE_6","CIRCLE_6","CIRCLE_8","CIRCLE_9"],"groupings":[],"flowers":["FLOWER_A1"]}}

const drawMoves = [
    {"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"DRAW","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":null,"groupWith":[]}}
]

const playMoves = [{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"STICK_1","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"STICK_3","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"STICK_3","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"STICK_3","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"STICK_4","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"STICK_4","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"NUMBER_1","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"NUMBER_1","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"NUMBER_1","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"NUMBER_2","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"NUMBER_4","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"NUMBER_5","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"NUMBER_8","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"CIRCLE_6","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"CIRCLE_6","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"CIRCLE_8","groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"PLAY","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"CIRCLE_9","groupWith":[]}}]

const eatData = {"id":"7dfc64ef-d357-4a8d-a9f2-14445ea6346b","type":"MAHJONG","data":{"deckSize":67,"tilesOut":["STICK_1","STICK_6","NUMBER_3","CIRCLE_9","NUMBER_8","CIRCLE_7","CIRCLE_7","NUMBER_5","NUMBER_2","BOARD","STICK_5"],"currentPlayerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","winner":null,"playersToMove":["d302ceb1-cf4b-44f1-abda-b0aaa91ac994"]},"playerData":{"hand":["STICK_2","STICK_3","STICK_3","STICK_3","STICK_4","NUMBER_1","NUMBER_1","NUMBER_1","NUMBER_2","NUMBER_4","NUMBER_5","CIRCLE_5","CIRCLE_6","CIRCLE_6","CIRCLE_8","CIRCLE_9"],"groupings":[],"flowers":["FLOWER_A1"]}}
const eatMoves = [{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"DRAW","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":null,"groupWith":[]}},{"gameType":"MAHJONG","moveInfo":{"@class":"com.jwango.game.engine.mahjong.MahjongMove","moveType":"EAT","playerId":"d302ceb1-cf4b-44f1-abda-b0aaa91ac994","tile":"STICK_5","groupWith":["STICK_3","STICK_4"]}}]