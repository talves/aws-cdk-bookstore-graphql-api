import { AppSyncResolverHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { Book } from "../types/books";

const documentClient = new DynamoDB.DocumentClient();

export const handler: AppSyncResolverHandler<
  null,
  Book[] | null
> = async () => {
  try {
    if (!process.env.BOOKS_TABLE) {
      console.log("Error: BOOKS_TABLE was not specified in the env vars");

      return null;
    }

    const data = await documentClient
      .scan({ TableName: process.env.BOOKS_TABLE }) // expesive pulling in the whole table
      .promise();

    return data.Items as Book[];
  } catch (error) {
    console.error("Bad Call listBooks", error);
    return null;
  }
};
