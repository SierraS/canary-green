import {
  App,
  Stack,
  StackProps,
  RemovalPolicy,
  CfnOutput,
  Duration,
} from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
// https://docs.aws.amazon.com/cdk/v2/guide/migrating-v2.html
import * as synthetics from "@aws-cdk/aws-synthetics-alpha";
import path = require("path");

export interface AppStackProps extends StackProps {
  customProp?: string;
}
export class AppStack extends Stack {
  constructor(scope: App, id: string, props: AppStackProps = {}) {
    super(scope, id, props);
    const { customProp } = props;
    const defaultBucketProps = {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    };
    const bucket = new s3.Bucket(this, "Bucket", {
      ...defaultBucketProps,
      versioned: true,
    });
    new CfnOutput(this, "BucketName", {
      value: bucket.bucketName,
    });

    const vpc1 = new ec2.Vpc(this, "VPC1");

    // security group
    const sg1 = new ec2.SecurityGroup(this, "SG1", { vpc: vpc1 });

    // subnet

    // role1: role with subnet permissions
    const role1 = new iam.Role(this, "roleWithSubnetOnly", {
      assumedBy: new iam.AccountPrincipal(this.account),
    });
    // role 2: role with networkinterface and subnet permissions
  }
}
