# GitHub Codespacesを使った環境構築

GitHub Codespacesを使う事で、お手軽にAWS CDK + ecspressoによる構築を試せます。

## 用意するもの

AdministratorAccessのあるIAMユーザー

## 環境構築手順

- Github上から*Code*タブを開き、`Create a codespaces`を選択します。
- codespacesの起動が完了したら、`aws configure`でIAMユーザーの`Access Key Id`、`Secret Access Key`、`Default region name`を選択してください。
- 以上でAWS CDKとecspressoが使える状態となります。

## サンプルスタックのデプロイ手順

### デプロイ手順

- `cdk deploy CdkEcspressoStack`でCloudFormationスタックをデプロイ
- その後、`cd ecpresso`の後`ecspresso deploy`
- 上記コマンドで、ALBにぶら下がったプライベートサブネット内のnginxコンテナの構築が可能です。

### 動作確認

- 構築されたALBの`DNS name:8080`で`Welcome to nginx!`が表示されたらデプロイ成功です。

### 削除手順

- AWSのコンソール上からnginxサービスを0にします。
- `ecspresso delete`を実行後、サービス名を聞かれるので`nginx`と入力しEnter
- `cd ../`の後`cdk destroy CdkEcspressoStack`を選択し、確認で`y`を選択しEnter
