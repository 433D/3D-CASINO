// server.js
const express = require('express');  // Webサーバーのフレームワーク
const http = require('http');        // HTTPサーバーを作成するためのモジュール
const socketIo = require('socket.io'); // リアルタイム通信のためのライブラリ
const fs = require('fs');            // ファイル操作のためのモジュール

const app = express();               // Expressアプリケーションの作成
const server = http.createServer(app); // HTTPサーバーの作成
const io = socketIo(server);         // Socket.IOの初期化

const DATA_FILE = 'bets.json';       // 賭け情報を保存するファイル名

// データをJSONファイルから読み込む関数
function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
    return [];  // ファイルが存在しない場合は空の配列を返す
}

// データをJSONファイルに保存する関数
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let bets = loadData(); // 初期データの読み込み

// クライアントが接続したときの処理
io.on('connection', (socket) => {
    console.log('クライアントが接続しました');

    // 現在の賭けデータを新しいクライアントに送信
    socket.emit('loadData', bets);

    // 新しい賭け情報がクライアントから送られてきたときの処理
    socket.on('newBet', (bet) => {
        bets.push(bet);      // 賭けデータを追加
        saveData(bets);      // データを保存
        io.emit('loadData', bets); // すべてのクライアントに更新を通知
    });

    // クライアントが切断したときの処理
    socket.on('disconnect', () => {
        console.log('クライアントが切断しました');
    });
});

// 静的ファイルの提供
app.use(express.static('public'));

// サーバーのポート設定
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`サーバーが http://localhost:${PORT} で起動しました`);
});
