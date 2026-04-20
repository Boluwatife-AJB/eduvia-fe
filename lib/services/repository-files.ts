import { apiClient } from "@/lib/api";

type ApiEnvelope<T> = {
  data: T;
};

type NullableString = string | null;

export type CreateRepositoryFileInput = {
  scope: string;
  scope_id: NullableString;
  folder_id: string;
  name: string;
  file_url: string;
  file_key: string;
  description?: NullableString;
  tags?: string[];
  expires_at?: NullableString;
  change_note?: NullableString;
  linked_record_type?: NullableString;
  linked_record_id?: NullableString;
};

export type RepositoryFileRecord = {
  id: string;
  scope: string;
  scope_id: NullableString;
  folder_id: string;
  name: string;
  description: NullableString;
  tags: string[];
  file_url: string;
  file_key: string;
  expires_at: NullableString;
  change_note: NullableString;
  linked_record_type: NullableString;
  linked_record_id: NullableString;
};

function normalizeCreatePayload(
  payload: CreateRepositoryFileInput,
): CreateRepositoryFileInput {
  const expiresRaw = payload.expires_at;
  const expires_at =
    expiresRaw === undefined || expiresRaw === null || expiresRaw.trim() === ""
      ? ""
      : expiresRaw.trim();

  const changeRaw = payload.change_note;
  const change_note =
    changeRaw === undefined || changeRaw === null || changeRaw.trim() === ""
      ? ""
      : changeRaw.trim();

  return {
    scope: payload.scope,
    scope_id: payload.scope_id ?? null,
    folder_id: payload.folder_id,
    name: payload.name.trim(),
    file_url: payload.file_url,
    file_key: payload.file_key,
    description: payload.description ?? null,
    tags: payload.tags ?? [],
    expires_at,
    change_note,
    linked_record_type: payload.linked_record_type ?? null,
    linked_record_id: payload.linked_record_id ?? null,
  };
}

export async function createRepositoryFile(
  payload: CreateRepositoryFileInput,
): Promise<RepositoryFileRecord> {
  const response = await apiClient.post<ApiEnvelope<RepositoryFileRecord>>(
    "/repository/files",
    normalizeCreatePayload(payload),
  );

  return response.data.data;
}
