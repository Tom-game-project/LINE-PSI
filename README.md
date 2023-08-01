
# PSI

## 関数計算のためのラインボット

![icon](images/icon(60x60).png)
<img src="images/LINE_Brand_icon.png" width="60px" height="60px">

LINEbotの友達追加は下のurlから👇👇👇

![qrcode](images/767sfzgv.png)

## 使い方

コマンドは大文字でも小文字でも構いません。
但し、コマンドの後には半角スペースを挿入する必要があります

- helpコマンド

    コマンドや使える関数一覧を返却します

    ```psi
    !help
    ```

    ![help](images/help.png)

- evalコマンド

    与えられた`<計算式>`が内部的にどのように解釈されているかを知ることが出来ます。返却された値はポーランド記法で返却されるネスト上データとなっています

    ```psi
    !eval <計算式>
    ```

    ![eval](images/eval.png)

- calcコマンド

    実際に`<計算式>`を実行して計算結果を返却します[^1]

    ```psi
    !calc <計算式>
    ```

    ![calc](images/calc.png)

## リポジトリについて

calc_parser.jsはボットのコードそのものではなく計算を評価する部分の抜粋です。

[^1]:javascriptの`Math`の関数を使っています。実際の計算結果と多少の誤差がある場合があります。

