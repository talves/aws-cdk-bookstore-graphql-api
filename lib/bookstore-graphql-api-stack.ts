import {Duration, Expiration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as appsync from "@aws-cdk/aws-appsync-alpha"
import { CfnDisk } from 'aws-cdk-lib/aws-lightsail';

export class BookstoreGraphqlApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "MyApi", {
      name: "my-book-api",
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            name: "My very own API key",
            expires: Expiration.after(Duration.days(365)),
          }
        }
      }
    });
  }
}
