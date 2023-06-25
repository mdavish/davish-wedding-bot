import { z, type ZodSchema } from "zod";
import { APIResponseSchema } from "./yextSchemas";

async function _getEntityResponse(
  apiKey: string,
  query?: Record<string, string>
) {
  let params = {
    api_key: apiKey,
    v: "20230101",
  };

  // Add query params to params object
  if (query) {
    params = { ...params, ...query };
  }

  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    urlParams.append(key, value);
  }

  const entitiesUrl = `https://cdn.yextapis.com/v2/accounts/me/entities?${urlParams.toString()}`;
  const response = await fetch(entitiesUrl);

  if (!response.ok) {
    throw new Error(
      `Error fetching entities at ${entitiesUrl}: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  return APIResponseSchema.parse(json);
}

export async function getEntities<T extends ZodSchema>(
  apiKey: string,
  query?: Record<string, string>,
  schema?: T
): Promise<Array<z.infer<T>>> {
  const parsedResponse = await _getEntityResponse(apiKey, query);

  if (schema) {
    return parsedResponse.response.entities.map((entity) =>
      schema.parse(entity)
    );
  } else {
    return parsedResponse.response.entities;
  }
}

export async function getAllEntities<T extends ZodSchema>(
  apiKey: string,
  query?: Record<string, string>,
  schema?: T
): Promise<Array<z.infer<T>>> {
  const entities: Array<z.infer<T>> = [];
  let pageToken: string | undefined = undefined;

  do {
    let updatedQuery = query;
    if (pageToken) {
      updatedQuery = { ...query, pageToken };
    }
    const response = await _getEntityResponse(apiKey, {
      ...updatedQuery,
    });
    // Add entities to array
    if (schema) {
      entities.push(
        ...response.response.entities.map((entity) => schema.parse(entity))
      );
    } else {
      entities.push(...response.response.entities);
    }
    // Update pageToken
    pageToken = response.response.pageToken;
  } while (pageToken);

  return entities;
}
