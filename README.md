# midcareer-teacher — 中途｜教員向け

- 公開URL: https://reflame.co.jp/lp/midcareer/teacher/
- 担当: 金山さん
- 仕組みの元: [reflameinc/aff](https://github.com/reflameinc/aff)（プルリクエストをマージすると本番に反映される仕組み）
- 困ったとき: 有川へ。画面に出た文をそのまま貼ってください

## いまの状態（2026-10-19 時点）

| 項目 | 状態 | やる人 |
|---|---|---|
| 自動反映の設定ファイル（`.github/`・`scripts/`） | 済み。aff と同じ内容に、下の「このLPだけの違い」を足したもの | — |
| main を守るルール・production 環境・サーバーの指紋（`DEPLOY_KNOWN_HOSTS`） | 済み | — |
| サーバーに入る鍵（`DEPLOY_SSH_KEY`） | **未** | 中山さん（作業A） |
| LPのファイル（`index.html`・`assets/`） | **未**。このリポジトリにはまだLPが入っていない | 金山さん（作業B） |
| 本番へ反映するスイッチ（`DEPLOY_ENABLED`） | オフ | 有川（作業C） |

スイッチがオフの間は、マージしても本番は変わりません。AとBの両方が済んだら、Cに進みます。AとBはどちらが先でもかまいません。

### このLPだけの違い（aff との差）

- 転送先は `/lp/midcareer/teacher/` に固定。初回の転送で `teacher/` フォルダが作られる（サーバーで事前に作る必要はない）。
- `/lp/midcareer/`（中途メインLP）の配下にあるが、中途メインLPの公開は削除同期をしないので、このLPが消えることはない。

## 作業A: サーバーに入る鍵を登録する（中山さんのPC）

10/6 に12本へ登録したのと同じ鍵を、このリポジトリにも登録します。鍵は GitHub から取り出せないため、鍵のあるPCでしかできません。

1. 中山さんのPCで Claude Code を開く（フォルダはどこでもよい）。
2. 下の文をそのまま貼る。

```
reflameinc/midcareer-teacher に、本番サーバーの SSH 鍵を登録してください。

- 鍵は、10/6 に reflameinc の LP リポジトリ12本の production 環境へ DEPLOY_SSH_KEY として登録したのと同じ秘密鍵です。このPCの中から探してください（~/.ssh/ など）。
- 見つけた鍵が正しいことを、次のコマンドが ok を返すことで確かめてください。
  ssh -i <鍵のパス> -p 8022 -o BatchMode=yes r1300591@www1151.onamae.ne.jp "echo ok"
- 鍵にパスフレーズが付いているときは、パスフレーズを外した一時コピーを作って登録し、登録後すぐにコピーを消してください（パスフレーズ付きのまま登録すると公開が失敗します）。
- 鍵の中身は、画面にもファイルにも出さないでください。
- 確かめられたら、次のコマンドで登録してください。
  gh secret set DEPLOY_SSH_KEY --env production -R reflameinc/midcareer-teacher < <鍵のパス>
- 最後に gh secret list --env production -R reflameinc/midcareer-teacher を実行し、DEPLOY_SSH_KEY と DEPLOY_KNOWN_HOSTS の2つが並んでいることを見せてください。
```

3. うまくいったとき: `DEPLOY_SSH_KEY` と `DEPLOY_KNOWN_HOSTS` の2行が出る。
4. うまくいかないとき: 「鍵が見つからない」「Permission denied」「HTTP 403」などの文を、そのまま有川へ送る。

## 作業B: LPのファイルを入れる（金山さんのPC）

制作したLP（2026-10-17 に Slack で共有した `REFLAME_教員向けLP_公開用_20261017`）を、このリポジトリに入れます。

1. reflame-marketing のフォルダで Claude Code を開く。
2. 下の文の `<　>` を、LPの元ファイルが入っているフォルダの場所に書き換えて貼る。

```
教員向けLP（midcareer-teacher）に最初のファイルを入れて公開まで進めたいです。
LPの元ファイルは <このPCのフォルダの場所> にあります。
入れ方の決まりは reflameinc/midcareer-teacher の README.md の「作業B」に書いてあるので、先に読んでから始めてください。
```

3. Claude Code の質問に答えながら進める。プルリクエストができたら、表示されたURLをブラウザで開く。
4. 画面の下のほうに、緑のチェックと「check」の文字が出るまで待つ（1〜2分）。
5. 緑になったら「Merge pull request」→「Confirm merge」を押す（この時点ではまだ本番は変わらない）。
6. 有川へ「midcareer-teacher にLPを入れてマージしました」と連絡する（作業Cへ）。

赤い × が出たときは、×の横の「Details」を開き、🛑 が付いた行を Claude Code に貼って「これを直して」と頼みます。直らなければ、その行を有川へ送ってください。

### 決まり（Claude Code はここを読んで作業する）

- **入れるもの**: `index.html` と `assets/` だけ。`設置手順.md` などの説明ファイルは入れない。
- **置き方**: `index.html` はいちばん上の階層。画像・CSS・JS・フォント・動画は、すべて `assets/` の中に置く。本番へ送られるのは `index.html` と `assets/` だけなので、いちばん上に置いた CSS・JS は本番に届かない。
- **このLPで直すこと（元ファイルのままでは公開できない3点）**:
  1. `style.css`・`config.js`・`script.js` を `assets/` へ移し、`index.html` の読み込み先を `assets/style.css`・`assets/config.js`・`assets/script.js` に書き換える。
  2. `assets/reflame-logo.svg`・`assets/hero-school.svg` を消す。svg はファイルとして置けない。どちらもページからは使われていない（ロゴは `index.html` に直接書かれている）。
  3. 計測を入れる。`index.html` の `<head>` と `<body>` の直後に GTM（`GTM-5KH7WRCP`）のタグを入れ、`config.js` の `tracking` を `enabled: true`・`gtmId: 'GTM-5KH7WRCP'` にする。`dataLayer` に送るイベントには `lp: 'midcareer_teacher'` を付ける（ほかのLPと見分けるため）。
- **`assets/` に置ける種類**: png・jpg・jpeg・webp・gif・avif・ico・css・js・woff・woff2・mp4・webm。ファイル名は英数字と `_` `-` `.` だけ、拡張子は小文字。
- **noindex は残す**: 広告からの流入専用のため、`<meta name="robots" content="noindex,nofollow">` は消さない（消すと検品で止まる）。
- **上の3点以外の見た目・文言は変えない**: 迷ったら、勝手に決めず担当に見せて決めてもらう。
- **main に直接は入れられない**: ブランチを作る → プルリクエストを作る → 検品（check）が緑 → マージ、の順。
- **`.github/` と `scripts/` は触らない**: 変えると中山さんのレビューが必要になる。
- **検品は GitHub の画面で見る**: Mac に最初から入っている bash では `scripts/check.sh` がエラーで止まる。手元で動かなくても、プルリクエストの check が緑なら問題ない。

## 作業C: 本番へ反映するスイッチを入れる（有川）

1. 作業Bのマージ後、Actions の `deploy` が「▶ 予行演習モード」で動き、「転送予定 N 件」の一覧に `index.html`・`assets/…` が出ていることを有川が確かめる（作業Aが済んでいないと、ここで「Secret DEPLOY_SSH_KEY が未登録」と出て止まる）。
2. 有川がリポジトリ変数 `DEPLOY_ENABLED` を `true` にして、`deploy` をやり直す。
3. 本番へ転送され、「✓ 本番の index.html がリポジトリと一致」「✓ assets 全て HTTP 200」が出れば完了。
4. 担当が本番を開き、「無料で転職相談」ボタン（5か所）が予約ページへ移ること・スクロール追従ボタンが出ることを確かめる。1件予約し、計測が動くことを有川と確かめる。

## 作業A〜Cが終わったあとの、ふだんの直し方

reflame-marketing のフォルダで Claude Code に「教員向けLPのここを直して」と頼みます（`lp` スキル）。ブランチを作る → 直す → プルリクエスト → check が緑 → マージ、の順で、マージした時点で本番に反映されます。戻すときは、マージ済みプルリクエストの「Revert」を押し、できたプルリクエストをマージします。

**GitHub に入れたLPは、サーバーへ直接上げない（FileZilla 等を使わない）。** 直接上げると、次の公開で GitHub の中身に上書きされて消えます。
