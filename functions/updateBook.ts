import dynoexpr from "@tuplo/dynoexpr";
import { AppSyncResolverHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { Book, MutationUpdateBookArgs } from "../types/books";

const documentClient = new DynamoDB.DocumentClient();

export const handler: AppSyncResolverHandler<
  MutationUpdateBookArgs,
  Book | null
> = async (event) => {
  const book = event.arguments.book;

  try {
    if (!process.env.BOOKS_TABLE) {
      console.log("Error: BOOKS_TABLE was not specified in the env vars");

      return null;
    }

    const params = dynoexpr<DynamoDB.DocumentClient.UpdateItemInput>({
      TableName: process.env.BOOKS_TABLE,
      Key: { id: book.id },
      ReturnValues: "ALL_NEW",
      Update: {
        ...(book.title !== undefined ? { title: book.title } : {}),
        ...(book.rating !== undefined ? { rating: book.rating } : {}),
        ...(book.completed !== undefined ? { completed: book.completed } : {}),
      },
    });

    const result = await documentClient.update(params).promise();

    return result.Attributes as Book;
  } catch (error) {
    console.error("Bad call createBook", error);
    return null;
  }
};
