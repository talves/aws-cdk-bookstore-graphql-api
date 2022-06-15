import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as appsync from "@aws-cdk/aws-appsync-alpha"

export class BookstoreGraphqlApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "MyApi", {
      name: "my-book-api",
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
    });
  }
}
