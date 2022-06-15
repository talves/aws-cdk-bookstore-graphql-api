import { Duration, Expiration, Stack, StackProps } from 'aws-cdk-lib';
import {Construct} from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as appsync from "@aws-cdk/aws-appsync-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";

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

    const listBooksLambda = new lambda.Function(this, "list-books-handler", {
      code: lambda.Code.fromAsset("functions"),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "listBooks.handler",
    });

    const listBooksDataSource = api.addLambdaDataSource(
      "listBooksDataSource",
      listBooksLambda,
    );

    listBooksDataSource.createResolver({
      typeName: "Query",
      fieldName: "listBooks",
    })
  }
}
