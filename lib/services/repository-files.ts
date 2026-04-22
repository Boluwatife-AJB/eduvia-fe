import { apiClient } from "@/lib/api";
import {
  ApiEnvelope,
  CreateRepositoryFileInput,
  RepositoryFileRecord,
} from "@/types";

function normalizeCreatePayload(
  payload: CreateRepositoryFileInput,
): CreateRepositoryFileInput {
  const expiresRaw = payload.expires_at;
  const expires_at =
    expiresRaw === undefined || expiresRaw === null || expiresRaw.trim() === ""
      ? null
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
