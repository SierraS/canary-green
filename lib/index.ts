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
      schedule: synthetics.Schedule.rate(Duration.minutes(50)),
      test: synthetics.Test.custom({
        code: synthetics.Code.fromInline(
`const synthetics = require("Synthetics");
const log = require("SyntheticsLogger");

const pageLoadBlueprint = async function () {
  // Configure the stage of the API using environment variables
  const url = "http://phillyactso.org";

  const page = await synthetics.getPage();
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  // Wait for page to render. Increase or decrease wait time based on endpoint being monitored.
  await page.waitFor(15000);
  // This will take a screenshot that will be included in test output artifacts.
  await synthetics.takeScreenshot("loaded", "loaded");
  const pageTitle = await page.title();
  log.info("Page title: " + pageTitle);
  if (response.status() !== 200) {
    throw "Failed to load page!";
  }
};

exports.handler = async () => {
  return await pageLoadBlueprint();
};`


        ),
        handler: 'index.handler',
      }),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_1,
      environmentVariables: {
        stage: 'prod',
      },
    });
  }
}
