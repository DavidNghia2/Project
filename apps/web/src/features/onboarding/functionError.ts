export async function functionErrorMessage(error: { message: string; context?: unknown }): Promise<string> {
  const response = error.context;
  if (response instanceof Response) {
    const body = await response.clone().json().catch(() => null) as { error?: string } | null;
    if (body?.error) return body.error;
  }
  return error.message;
}
