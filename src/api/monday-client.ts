import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

export async function mondayApi<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const embedded = window !== window.parent;
  if (embedded) {
    const res = await monday.api(query, { variables });
    return res.data as T;
  } else {
    const resp = await fetch("/monday", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const json = await resp.json();
    if (json.errors)
      throw new Error(json.errors[0]?.message ?? "GraphQL error");
    return json.data as T;
  }
}
