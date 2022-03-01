import { App, Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
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

    const canary = new synthetics.Canary(this, 'MyCanary', {
      schedule: synthetics.Schedule.rate(Duration.minutes(2)),
      test: synthetics.Test.custom({
        code: synthetics.Code.fromAsset(path.join(__dirname, '../canary')),
        handler: 'index.handler',
      }),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_1,
      environmentVariables: {
        stage: 'prod',
      },
    });
  }
}
