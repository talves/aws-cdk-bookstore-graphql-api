import { AppSyncResolverHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { Book, MutationCreateBookArgs } from "../types/books";

const documentClient = new DynamoDB.DocumentClient();

export const handler: AppSyncResolverHandler<
  MutationCreateBookArgs,
  Book | null
> = async (event) => {
  const book = event.arguments.book;

  try {
    if (!process.env.BOOKS_TABLE) {
      console.log("Error: BOOKS_TABLE was not specified in the env vars");

      return null;
    }

    const data = await documentClient
      .put({ TableName: process.env.BOOKS_TABLE, Item: book })
      .promise();

    return book;
  } catch (error) {
    console.error("Bad call createBook", error);
    return null;
  }
};
