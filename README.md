# MindAR Sticky Notes

MindARとA-Frameを利用して、画像ターゲット上にカスタマイズ可能な付箋メモを表示するWebアプリです。ターゲット画像をカメラに映すと、選択した色とテキストの付箋がARとして表示されます。

## 使い方

1. HTTPSでホストされた環境（例: `npm install -g serve` のようなツールで `serve -s . -l 5000 --ssl-cert cert.pem --ssl-key key.pem` など）で `index.html` を配信します。
2. ブラウザでページを開き、カメラ利用の許可を与えます。
3. [MindARのサンプルターゲット画像](https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.4/examples/image-tracking/assets/card.png) を印刷するか別デバイスに表示します。
4. カメラでターゲットを映すと、AR上に付箋が表示されます。入力欄からメモ内容や色を変更すると即座に反映され、メモはブラウザのローカルストレージに保存されます。メモ欄には120文字の目安と現在の文字数が表示されるため、AR上で見やすいボリュームを保ちながら編集できます。

## 開発メモ

- MindARのCDN配信ビルド (`mindar-image-aframe.prod.js`) を利用しています。
- A-Frameのエンティティ (`a-text` / `a-plane`) を組み合わせて付箋の表現を作成しています。
- `src/main.js` でフォーム入力からAR要素へテキスト・カラーを反映し、初期化時にはMindARの開始イベントをハンドリングしています。また、入力内容はローカルストレージに保存し再訪時に復元します。保存済みのカスタムカラーも自動的に選択肢に追加されるため、以前の配色を失う心配がありません。
