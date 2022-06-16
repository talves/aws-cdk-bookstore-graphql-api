import { Duration, Expiration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as appsync from "@aws-cdk/aws-appsync-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

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
          },
        },
      },
    });

    const booksTable = new dynamodb.Table(this, "BooksTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // The common properties of all the lambda functions
    const commonLambdaProps: Omit<lambda.FunctionProps, "handler"> = {
      code: lambda.Code.fromAsset("functions"),
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 1024,
      architecture: lambda.Architecture.ARM_64,
      environment: {
        BOOKS_TABLE: booksTable.tableName,
      },
    };

    const listBooksLambda = new lambda.Function(this, "list-books-handler", {
      handler: "listBooks.handler",
      ...commonLambdaProps,
    });

    // ensures the lambda can read from the table (minimal security for protection)
    booksTable.grantReadData(listBooksLambda);

    const listBooksDataSource = api.addLambdaDataSource(
      "listBooksDataSource",
      listBooksLambda
    );

    listBooksDataSource.createResolver({
      typeName: "Query",
      fieldName: "listBooks",
    });

    const createBookLambda = new lambda.Function(this, "createBookHandler", {
      handler: "createBook.handler",
      ...commonLambdaProps,
    });

    booksTable.grantReadWriteData(createBookLambda);

    // Lambda datasource for the create Book function
    const createBookDataSource = api.addLambdaDataSource(
      "createBookDataSource",
      createBookLambda
    );

    createBookDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "createBook",
    });

    // Creates the lambda function
    const getBookByIdLambda = new lambda.Function(this, "getBookById", {
      handler: "getBookById.handler",
      ...commonLambdaProps,
    });

    // Grants the permissions to allow function to read the data from DynamoDB Table
    booksTable.grantReadData(getBookByIdLambda);

    // Creates the data source for the appsync api
    const getBookByIdDataSource = api.addLambdaDataSource(
      "getBookByIdDataSource",
      getBookByIdLambda
    );

    // makes sure whenever we use graphql Query for the resolver it executes the lambda function
    getBookByIdDataSource.createResolver({
      typeName: "Query",
      fieldName: "getBookById",
    });
  }
}
