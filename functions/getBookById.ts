import { AppSyncResolverHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { Book, QueryGetBookByIdArgs } from "../types/books";

const documentClient = new DynamoDB.DocumentClient();

export const handler: AppSyncResolverHandler<
  QueryGetBookByIdArgs,
  Book | null
> = async (event) => {
  const bookId = event.arguments.bookId;

  try {
    if (!process.env.BOOKS_TABLE) {
      console.log("Error: BOOKS_TABLE was not specified in the env vars");

      return null;
    }

    const data = await documentClient
      .get({ TableName: process.env.BOOKS_TABLE, Key: { id: bookId } })
      .promise();

    return data.Item as Book;
  } catch (error) {
    console.error("Bad Call getBookById", error);
    return null;
  }
};
