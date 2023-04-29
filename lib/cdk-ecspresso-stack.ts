import { Stack, StackProps } from "aws-cdk-lib";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Vpc } from 'aws-cdk-lib/aws-ec2'
import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { LogGroup } from "aws-cdk-lib/aws-logs";

// CDK + ecspressoで構築するコンテナ関連リソース
export class CdkEcspressoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);
    // VPC
    const vpc = new Vpc(this, "Vpc", { maxAzs: 2 });
    const subnetIdList = vpc.privateSubnets.map(obj => obj.subnetId);
    // SG
    const albSg = new ec2.SecurityGroup(this, 'AlbSg', { vpc, allowAllOutbound: false });
    const containerSg = new ec2.SecurityGroup(this, 'ContainerSg', { vpc });
    albSg.addIngressRule(ec2.Peer.ipv4('0.0.0.0/0') , ec2.Port.tcp(8080)); // インバウンドを許可
    albSg.connections.allowTo(containerSg, ec2.Port.tcp(80));  // ALB ⇔ コンテナ間の通信を許可
    // ALB    
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', { vpc, internetFacing: true, securityGroup: albSg });
    // TG
    const containerTg = new elbv2.ApplicationTargetGroup(this, 'ContainerTg', { targetType: elbv2.TargetType.IP, port: 80, vpc });
    // ALBリスナー
    alb.addListener('Listener', { defaultTargetGroups: [containerTg], open: true, port: 8080 }); // 作成したTGをALBに紐づけ
    // ECSクラスタ
    const cluster = new Cluster(this, 'EcsCluster', { vpc, clusterName: 'cdk-ecspresso' });
    // タスクロール
    const taskRole = new Role(this, 'TaskRole', { assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'), });
    // タスク実行ロール
    const taskExecRole = new Role(this, 'TaskExecRole', { assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'), });
    // ロググループ
    const logGroup = new LogGroup(this, 'logGroup', {});
    // ECR
    const repository = new Repository(this, 'Repository', {});
    // タスク実行ロールに権限付与
    repository.grantPull(taskExecRole); // ECRのPULL権限
    logGroup.grantWrite(taskExecRole); // ログ吐き出し権限

    // SSMパラメータの設定
    new ssm.StringParameter(this, 'TaskRoleParam', { parameterName: '/ecs/cdk-ecspresso/task-role', stringValue: taskRole.roleArn });
    new ssm.StringParameter(this, 'TaskExecRoleParam', { parameterName: '/ecs/cdk-ecspresso/task-exec-role', stringValue: taskExecRole.roleArn });
    new ssm.StringParameter(this, 'ContainerSubnet1Param', { parameterName: '/ecs/cdk-ecspresso/subnet-id-a', stringValue: subnetIdList[0] });
    new ssm.StringParameter(this, 'ContainerSubnet2Param', { parameterName: '/ecs/cdk-ecspresso/subnet-id-c', stringValue: subnetIdList[1] });
    new ssm.StringParameter(this, 'ContainerSgParam', { parameterName: '/ecs/cdk-ecspresso/sg-id', stringValue: containerSg.securityGroupId });
    new ssm.StringParameter(this, 'ContainerTgParam', { parameterName: '/ecs/cdk-ecspresso/tg-arn', stringValue: containerTg.targetGroupArn });
    new ssm.StringParameter(this, 'LogGroupParam', { parameterName: '/ecs/cdk-ecspresso/log-group-name', stringValue: logGroup.logGroupName });
  }
}